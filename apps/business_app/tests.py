from unittest.mock import patch, MagicMock
from types import SimpleNamespace

import pytest
import networkx as nx
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.cache import cache
from django.urls import reverse
from apps.business_app import admin as business_admin
from rest_framework.test import APIClient
from apps.common.utils.pusher_client import PusherClient


from apps.business_app.models.allele_node import AlleleNode
from apps.business_app.models.base_allele_node import BaseAlleleNode
from apps.business_app.models.allowed_extensions import AllowedExtensions
from apps.business_app.models.gene import Gene
from apps.business_app.models.gene_status import GeneStatus
from apps.business_app.models.gene_status_middle import GeneStatusMiddle
from apps.business_app.models.protein_node import ProteinNode
from apps.business_app.models.study import Study
from apps.business_app.models.study_type import StudyType
from apps.business_app.models.uploaded_files import UploadedFiles
from apps.business_app.serializers.allele_nodes import AlleleNodeSerializer
from apps.business_app.serializers.protein_nodes import ProteinNodeSerializer
from apps.business_app.serializers.study import StudySerializer
from apps.business_app.serializers.uploaded_files import UploadedFilesSerializer
from apps.business_app.utils.gene_list_cache import (
    GENE_LIST_VERSION_KEY,
    get_gene_list_cache_version,
)
from apps.business_app.utils.xslx_to_pdb_by_protein import XslxToPdbByProtein
from apps.users_app.models.system_user import SystemUser


@pytest.mark.django_db
def test_uploaded_files_save_dispatches_celery_task_on_create(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(username="uploaded_create", password="secret")
    upload = SimpleUploadedFile(
        "source.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.proccess_individual_processor_class.apply_async"
    ) as mocked_apply_async:
        instance = UploadedFiles.objects.create(
            custom_name="my file",
            original_file=upload,
            system_user=user,
        )

        # Se llama una vez por cada clase procesadora registrada (5 en total)
        assert mocked_apply_async.call_count == 5
        for call in mocked_apply_async.call_args_list:
            # delay() llama apply_async(args_list, kwargs_dict) con args posicionales,
            # por lo que los argumentos llegan en call.args[0], no en call.kwargs.
            assert call.args[0][1] == instance.id


@pytest.mark.django_db
def test_uploaded_files_save_does_not_dispatch_task_on_update(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(username="uploaded_update", password="secret")
    upload = SimpleUploadedFile(
        "source.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.proccess_individual_processor_class.apply_async"
    ) as mocked_apply_async:
        instance = UploadedFiles.objects.create(
            custom_name="original",
            original_file=upload,
            system_user=user,
        )
        mocked_apply_async.reset_mock()

        instance.custom_name = "updated"
        instance.save()

    mocked_apply_async.assert_not_called()


@pytest.mark.django_db
def test_uploaded_files_save_does_not_dispatch_task_for_pdb(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".pdb", typical_app_name="PDB")
    user = SystemUser.objects.create_user(username="uploaded_pdb", password="secret")
    upload = SimpleUploadedFile(
        "source.pdb",
        b"ATOM      1  N   ASN A   1      38.428  13.947  24.947",
        content_type="chemical/x-pdb",
    )

    with patch(
        "apps.business_app.models.uploaded_files.proccess_individual_processor_class.apply_async"
    ) as mocked_apply_async:
        UploadedFiles.objects.create(
            custom_name="pdb file",
            original_file=upload,
            system_user=user,
        )

    mocked_apply_async.assert_not_called()


def test_allele_node_serializer_enqueues_task_when_graph_cache_miss():
    serializer = AlleleNodeSerializer()
    obj = SimpleNamespace(study=SimpleNamespace(id=999), number=10)
    obj.study_id = 999

    graph_key = AlleleNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=obj.study_id)
    cache_key = AlleleNode.CACHE_KEY_DESCENDANTS.format(
        study_id=obj.study.id,
        number=obj.number,
    )
    cache.delete(graph_key)
    cache.delete(cache_key)

    with patch(
        "apps.business_app.serializers.base_allele_nodes.build_uploaded_file_graph_cache_task"
    ) as mocked_task:
        result = serializer.get_predecessors(obj)

    assert result == []
    mocked_task.assert_called_once_with(obj.study.id)
    assert cache.get(cache_key) is None


def test_allele_node_serializer_uses_cached_graph_without_enqueuing_task():
    serializer = AlleleNodeSerializer()
    obj = SimpleNamespace(study=SimpleNamespace(id=1001), number=2)
    obj.study_id = 1001
    graph = nx.DiGraph()
    graph.add_edge(1, 2)

    graph_key = AlleleNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=obj.study_id)
    cache_key = AlleleNode.CACHE_KEY_DESCENDANTS.format(
        study_id=obj.study.id,
        number=obj.number,
    )
    cache.set(graph_key, graph, timeout=None)
    cache.delete(cache_key)

    with patch(
        "apps.business_app.serializers.base_allele_nodes.build_uploaded_file_graph_cache_task.delay"
    ) as mocked_delay:
        result = serializer.get_predecessors(obj)

    assert result == {1, 2}
    mocked_delay.assert_not_called()


def test_allele_node_serializer_exposes_order_field():
    serializer = AlleleNodeSerializer()

    assert "order" in serializer.fields


def test_protein_node_serializer_exposes_order_field():
    serializer = ProteinNodeSerializer()

    assert "order" in serializer.fields


def test_admin_node_list_display_and_fields_include_order():
    assert "order" in business_admin.AlleleNodeAdmin.list_display
    assert "order" in business_admin.AlleleNodeAdmin.fields
    assert "order" in business_admin.ProteinNodeAdmin.list_display


def test_uploaded_files_serializer_exposes_allele_nodes_field():
    serializer = UploadedFilesSerializer(
        context={"view": SimpleNamespace(action="list")}
    )
    assert "allele_nodes" in serializer.fields


def test_uploaded_files_serializer_does_not_implement_get_allele_nodes_method():
    serializer = UploadedFilesSerializer(
        context={"view": SimpleNamespace(action="create")}
    )
    assert not hasattr(serializer, "get_allele_nodes")


@pytest.mark.django_db
def test_study_serializer_exposes_study_type_display(tmp_path, settings):
    """study_type_display debe ser el nombre del StudyType relacionado."""
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(
        username="study_serializer", password="secret"
    )
    upload = SimpleUploadedFile(
        "study_serializer.xlsx",
        b"serializer-file",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    with patch(
        "apps.business_app.models.uploaded_files.proccess_individual_processor_class.apply_async"
    ):
        uploaded_file = UploadedFiles.objects.create(
            custom_name="Study Upload",
            original_file=upload,
            system_user=user,
        )
    study_type = StudyType.objects.create(name="Location", sheet_name="Location Sheet")
    study = Study(
        uploaded_file=uploaded_file,
        successfull_load=True,
        extra_info="Coordinates loaded",
    )
    study.study_type = study_type
    study.save()

    data = StudySerializer(study).data

    assert data["study_type_display"] == "Location"


@pytest.mark.django_db
def test_study_viewset_lists_studies_by_uploaded_file(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(username="study_list", password="secret")

    upload_one = SimpleUploadedFile(
        "study_one.xlsx",
        b"file-one",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    upload_two = SimpleUploadedFile(
        "study_two.xlsx",
        b"file-two",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.proccess_individual_processor_class.apply_async"
    ):
        uploaded_file_one = UploadedFiles.objects.create(
            custom_name="Upload One",
            original_file=upload_one,
            system_user=user,
        )
        uploaded_file_two = UploadedFiles.objects.create(
            custom_name="Upload Two",
            original_file=upload_two,
            system_user=user,
        )

    study_type_location = StudyType.objects.create(
        name="Location", sheet_name="Location Sheet"
    )
    study_type_ancestors = StudyType.objects.create(
        name="Ancestors", sheet_name="Ancestors Sheet"
    )

    Study.objects.create(
        uploaded_file=uploaded_file_one,
        study_type=study_type_location,
        successfull_load=True,
        extra_info="Included",
    )
    Study.objects.create(
        uploaded_file=uploaded_file_two,
        study_type=study_type_ancestors,
        successfull_load=False,
        extra_info="Excluded",
    )

    client = APIClient()
    response = client.get(
        reverse(
            "study-by-uploaded-file-list",
            kwargs={"parent_lookup_uploaded_file": uploaded_file_one.id},
        )
    )

    assert response.status_code == 200
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["uploaded_file"] == uploaded_file_one.id
    assert response.data["results"][0]["study_type_display"] == "Location"


@pytest.mark.django_db
def test_study_type_endpoint_lists_created_study_types():
    StudyType.objects.create(
        name="Allele Type",
        sheet_name="For3DAllele",
        classification=StudyType.CLASSIFICATION.ALLELE,
    )
    StudyType.objects.create(
        name="Protein Type",
        sheet_name="For3DProt",
        classification=StudyType.CLASSIFICATION.PROTEIN,
    )

    client = APIClient()
    response = client.get(reverse("study-types-list"))

    assert response.status_code == 200
    assert len(response.data["results"]) >= 2
    names = {row["name"] for row in response.data["results"]}
    assert {"Allele Type", "Protein Type"}.issubset(names)


@pytest.mark.django_db
def test_study_type_endpoint_creates_item_with_default_classification():
    user = SystemUser.objects.create_user(
        username="study_type_creator",
        password="secret",
    )
    client = APIClient()
    client.force_authenticate(user=user)

    payload = {
        "name": "Location",
        "sheet_name": "For3DProt_L+Est",
    }

    response = client.post(reverse("study-types-list"), payload, format="json")

    assert response.status_code == 201
    assert response.data["classification"] == StudyType.CLASSIFICATION.ALLELE
    assert StudyType.objects.filter(name="Location").exists()


@pytest.mark.django_db
def test_gene_list_cache_version_bumps_on_gene_change():
    cache.clear()
    client = APIClient()
    GeneStatus.objects.create(
        name="Completeness", type=GeneStatus.TypeRepresentation.PERCENT
    )
    gene = Gene.objects.create(name="GeneCache01", description="before")

    list_url = reverse("gene-list")
    first_response = client.get(list_url)
    assert first_response.status_code == 200
    assert any(row["id"] == gene.id for row in first_response.data["results"])

    version_before = get_gene_list_cache_version()
    gene.description = "after"
    gene.save(update_fields=["description"])
    version_after = get_gene_list_cache_version()

    assert version_after == version_before + 1

    second_response = client.get(list_url)
    assert second_response.status_code == 200
    row = next(
        item for item in second_response.data["results"] if item["id"] == gene.id
    )
    assert row["description"] == "after"


@pytest.mark.django_db
def test_gene_list_cache_version_bumps_on_gene_status_middle_change():
    cache.clear()
    client = APIClient()
    status = GeneStatus.objects.create(
        name="Quality", type=GeneStatus.TypeRepresentation.PERCENT
    )
    gene = Gene.objects.create(name="GeneCache02")
    gsm = GeneStatusMiddle.objects.get(gene=gene, gene_status=status)

    list_url = reverse("gene-list")
    first_response = client.get(list_url)
    assert first_response.status_code == 200

    version_before = get_gene_list_cache_version()
    gsm.value = 77
    gsm.save(update_fields=["value"])
    version_after = get_gene_list_cache_version()

    assert version_after == version_before + 1

    second_response = client.get(list_url)
    assert second_response.status_code == 200
    row = next(
        item for item in second_response.data["results"] if item["id"] == gene.id
    )
    assert row["status"] == 77


@pytest.mark.django_db
def test_gene_list_cache_version_bumps_on_m2m_changes():
    cache.clear()
    GeneStatus.objects.create(
        name="Stability", type=GeneStatus.TypeRepresentation.PERCENT
    )
    gene = Gene.objects.create(name="GeneCache03")
    baseline_version = get_gene_list_cache_version()

    # Using clear() triggers post_clear m2m signal even when relation is empty.
    gene.groups.clear()
    assert get_gene_list_cache_version() == baseline_version + 1

    baseline_version = get_gene_list_cache_version()
    gene.disorders.clear()
    assert get_gene_list_cache_version() == baseline_version + 1


@pytest.mark.django_db
def test_gene_list_cache_version_key_exists_after_first_read():
    cache.clear()
    GeneStatus.objects.create(
        name="Coverage", type=GeneStatus.TypeRepresentation.PERCENT
    )
    Gene.objects.create(name="GeneCache04")

    assert cache.get(GENE_LIST_VERSION_KEY) is not None


def test_node_models_share_abstract_base_for_dry_structure():
    assert issubclass(AlleleNode, BaseAlleleNode)
    assert issubclass(ProteinNode, BaseAlleleNode)


def test_dry_refactor_keeps_existing_concrete_model_fields():
    """Verify that AlleleNode and ProteinNode share abstract base structure."""
    # Both models inherit from the abstract base
    assert issubclass(AlleleNode, BaseAlleleNode)
    assert issubclass(ProteinNode, BaseAlleleNode)

    # ProteinNode has its own specific field
    protein_fields = {field.name for field in ProteinNode._meta.local_fields}
    assert "is_final_for_allele" in protein_fields

    # Both models have the study FK (defined in BaseAlleleNode)
    allele_fields = {field.name for field in AlleleNode._meta.local_fields}
    assert "study" in allele_fields
    assert "study" in protein_fields


def test_xslx_to_pdb_by_protein_marks_final_node_and_updates_empty_allele_entries():
    processor = XslxToPdbByProtein.__new__(XslxToPdbByProtein)
    processor.study = SimpleNamespace(id=42)
    processor.model = MagicMock()
    mocked_queryset = MagicMock()
    processor.model.objects.filter.return_value = mocked_queryset

    created_node = SimpleNamespace(is_final_for_allele=False, save=MagicMock())

    with patch(
        "apps.business_app.utils.xslx_to_pdb.XslxToPdb._node_factory",
        return_value=created_node,
    ) as mocked_super_factory:
        result = processor._node_factory(
            element="C",
            row_number=7,
            allele="A*01",
            rs="rs123",
            region="REG",
            age_1=10,
            age_2=20,
            frec_afr_amr=None,
            frec_amr=None,
            frec_csa=None,
            frec_eas=None,
            frec_eur=None,
            frec_lat=None,
            frec_nea=None,
            frec_oce=None,
            frec_ssa=None,
            frec_afr_eas=None,
            frec_afr_swe=None,
            frec_afr_nor=None,
            frec_ca=None,
            frec_sa=None,
            loss=None,
            increment=None,
        )

    mocked_super_factory.assert_called_once()
    assert mocked_super_factory.call_args.kwargs["allele"] == "A*01"
    processor.model.objects.filter.assert_called_once_with(
        study=processor.study, allele=""
    )
    mocked_queryset.update.assert_called_once_with(allele="A*01")
    assert created_node.is_final_for_allele is True
    created_node.save.assert_called_once_with(update_fields=["is_final_for_allele"])
    assert result is created_node


def test_xslx_to_pdb_by_protein_skips_final_node_marking_for_short_alleles():
    processor = XslxToPdbByProtein.__new__(XslxToPdbByProtein)
    processor.study = SimpleNamespace(id=99)
    processor.model = MagicMock()

    created_node = SimpleNamespace(is_final_for_allele=False, save=MagicMock())

    with patch(
        "apps.business_app.utils.xslx_to_pdb.XslxToPdb._node_factory",
        return_value=created_node,
    ) as mocked_super_factory:
        result = processor._node_factory(
            element="C",
            row_number=8,
            allele="A",
            rs="rs456",
            region="REG",
            age_1=None,
            age_2=None,
            frec_afr_amr=None,
            frec_amr=None,
            frec_csa=None,
            frec_eas=None,
            frec_eur=None,
            frec_lat=None,
            frec_nea=None,
            frec_oce=None,
            frec_ssa=None,
            frec_afr_eas=None,
            frec_afr_swe=None,
            frec_afr_nor=None,
            frec_ca=None,
            frec_sa=None,
            loss=None,
            increment=None,
        )

    mocked_super_factory.assert_called_once()
    assert mocked_super_factory.call_args.kwargs["allele"] == ""
    processor.model.objects.filter.assert_not_called()
    created_node.save.assert_not_called()
    assert created_node.is_final_for_allele is False
    assert result is created_node


def test_protein_node_serializer_enqueues_task_when_graph_cache_miss():
    """Test that ProteinNodeSerializer requests graph cache task on cache miss."""
    serializer = ProteinNodeSerializer()
    obj = SimpleNamespace(study=SimpleNamespace(id=999), number=10)
    obj.study_id = 999

    graph_key = ProteinNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=obj.study_id)
    cache_key = ProteinNode.CACHE_KEY_DESCENDANTS.format(
        study_id=obj.study.id,
        number=obj.number,
    )
    cache.delete(graph_key)
    cache.delete(cache_key)

    with patch(
        "apps.business_app.serializers.base_allele_nodes.build_uploaded_file_graph_cache_task"
    ) as mocked_task:
        result = serializer.get_predecessors(obj)

    assert result == []
    mocked_task.assert_called_once_with(obj.study.id)
    assert cache.get(cache_key) is None


def test_protein_node_serializer_uses_cached_graph_without_enqueuing_task():
    """Test that ProteinNodeSerializer uses cached graph without requesting new computation."""
    serializer = ProteinNodeSerializer()
    obj = SimpleNamespace(study=SimpleNamespace(id=1001), number=2)
    obj.study_id = 1001
    graph = nx.DiGraph()
    graph.add_edge(1, 2)

    graph_key = ProteinNode.CACHE_KEY_GRAPH_FOR_STUDY.format(study_id=obj.study.id)
    cache_key = ProteinNode.CACHE_KEY_DESCENDANTS.format(
        study_id=obj.study.id,
        number=obj.number,
    )
    cache.set(graph_key, graph, timeout=None)
    cache.delete(cache_key)

    with patch(
        "apps.business_app.serializers.base_allele_nodes.build_uploaded_file_graph_cache_task.delay"
    ) as mocked_delay:
        result = serializer.get_predecessors(obj)

    assert result == {1, 2}
    mocked_delay.assert_not_called()


def test_fill_predecessors_and_sucessors_updates_allele_nodes_by_study_classification():
    """fill_predecessors_and_sucessors_for_all_nodes actualiza predecessors y
    sucessors de los AlleleNodes según el grafo construido."""
    node = SimpleNamespace(number=10, predecessors=[], sucessors=[])
    mocked_queryset = MagicMock()
    mocked_queryset.all.return_value = [node]

    with patch(
        "apps.business_app.tasks.Study.objects.get",
        return_value=SimpleNamespace(
            study_type=SimpleNamespace(classification=StudyType.CLASSIFICATION.ALLELE)
        ),
    ), patch(
        "apps.business_app.models.allele_node.AlleleNode.objects.filter",
        return_value=mocked_queryset,
    ), patch(
        "apps.business_app.models.allele_node.AlleleNode.objects.bulk_update"
    ) as mocked_bulk_update, patch(
        "apps.business_app.tasks._get_graph_info",
        side_effect=[{1, 10}, {10, 11}],
    ):
        from apps.business_app.tasks import (
            fill_predecessors_and_sucessors_for_all_nodes,
        )

        fill_predecessors_and_sucessors_for_all_nodes(study_id=123)

    assert set(node.predecessors) == {1, 10}
    assert set(node.sucessors) == {10, 11}
    mocked_bulk_update.assert_called_once()


def test_fill_predecessors_and_sucessors_updates_protein_nodes_by_study_classification():
    node = SimpleNamespace(number=20, predecessors=[], sucessors=[])
    mocked_queryset = MagicMock()
    mocked_queryset.all.return_value = [node]

    with patch(
        "apps.business_app.tasks.Study.objects.get",
        return_value=SimpleNamespace(
            study_type=SimpleNamespace(classification=StudyType.CLASSIFICATION.PROTEIN)
        ),
    ), patch(
        "apps.business_app.models.protein_node.ProteinNode.objects.filter",
        return_value=mocked_queryset,
    ), patch(
        "apps.business_app.models.protein_node.ProteinNode.objects.bulk_update"
    ) as mocked_bulk_update, patch(
        "apps.business_app.tasks._get_graph_info",
        side_effect=[{2, 20}, {20, 21}],
    ):
        from apps.business_app.tasks import (
            fill_predecessors_and_sucessors_for_all_nodes,
        )

        fill_predecessors_and_sucessors_for_all_nodes(study_id=456)

    assert set(node.predecessors) == {2, 20}
    assert set(node.sucessors) == {20, 21}
    mocked_bulk_update.assert_called_once()


def test_fill_predecessors_and_sucessors_raises_when_study_type_is_none():
    with patch(
        "apps.business_app.tasks.Study.objects.get",
        return_value=SimpleNamespace(study_type=None),
    ):
        from apps.business_app.tasks import (
            fill_predecessors_and_sucessors_for_all_nodes,
        )

        with pytest.raises(AttributeError):
            fill_predecessors_and_sucessors_for_all_nodes(study_id=789)


# ---------------------------------------------------------------------------
# Tests para _resolve_processor_class y proccess_individual_processor_class
# ---------------------------------------------------------------------------


def test_resolve_processor_class_returns_class_for_registered_name():
    """_resolve_processor_class devuelve la clase correcta para nombres registrados."""
    from apps.business_app.tasks import (
        _resolve_processor_class,
        PROCESSOR_CLASS_REGISTRY,
    )

    for class_name in PROCESSOR_CLASS_REGISTRY:
        resolved = _resolve_processor_class(class_name)
        assert resolved.__name__ == class_name


def test_resolve_processor_class_raises_value_error_for_unknown_name():
    """_resolve_processor_class lanza ValueError para nombres no registrados,
    previniendo ejecución de código arbitrario que eval() permitiría."""
    from apps.business_app.tasks import _resolve_processor_class

    with pytest.raises(ValueError, match="is not registered"):
        _resolve_processor_class("SomeArbitraryClass")


def test_resolve_processor_class_raises_value_error_for_builtin_name():
    """_resolve_processor_class rechaza builtins de Python (seguridad)."""
    from apps.business_app.tasks import _resolve_processor_class

    with pytest.raises(ValueError, match="is not registered"):
        _resolve_processor_class("os.system('echo injected')")


@pytest.mark.django_db
def test_proccess_individual_processor_class_sends_pusher_on_success(
    tmp_path, settings
):
    """La tarea envía el trigger de Pusher al finalizar exitosamente."""
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(username="ind_task_ok", password="secret")
    upload = SimpleUploadedFile(
        "ind_task_ok.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.proccess_individual_processor_class.apply_async"
    ):
        uploaded_file = UploadedFiles.objects.create(
            custom_name="Ind Task Ok",
            original_file=upload,
            system_user=user,
        )

    study_stub = SimpleNamespace(id=42, successfull_load=True)
    processor_ok = SimpleNamespace(
        proccess_pdb_file=lambda *_a, **_kw: None,
        study=study_stub,
        excel_nomenclator_class=SimpleNamespace(),
        output_df=SimpleNamespace(),
    )

    from apps.business_app.tasks import proccess_individual_processor_class

    with patch(
        "apps.business_app.tasks.SiteConfiguration.get_solo",
        return_value=SimpleNamespace(upload_to_drive=False),
    ), patch(
        "apps.business_app.tasks.XslxToPdbByAlleleStudy",
        return_value=processor_ok,
    ) as mocked_cls, patch("apps.business_app.tasks.create_graph"), patch(
        "apps.business_app.tasks.fill_predecessors_and_sucessors_for_all_nodes"
    ), patch("apps.business_app.tasks.send_pusher_trigger_task.delay") as mocked_pusher:
        mocked_cls.__name__ = "XslxToPdbByAlleleStudy"

        proccess_individual_processor_class.run(
            "XslxToPdbByAlleleStudy", uploaded_file.id
        )

    mocked_pusher.assert_called_once()
    call_kwargs = mocked_pusher.call_args.kwargs
    assert call_kwargs["event"] == PusherClient.STUDY_PROCESSED
    assert call_kwargs["data"]["study_id"] == 42


@pytest.mark.django_db
def test_proccess_individual_processor_class_does_not_send_pusher_when_no_study(
    tmp_path, settings
):
    """Si el processor_object no tiene atributo 'study', no se envía Pusher
    y la tarea termina sin AttributeError."""
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(
        username="ind_task_no_study", password="secret"
    )
    upload = SimpleUploadedFile(
        "ind_task_no_study.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.proccess_individual_processor_class.apply_async"
    ):
        uploaded_file = UploadedFiles.objects.create(
            custom_name="Ind Task No Study",
            original_file=upload,
            system_user=user,
        )

    processor_no_study = SimpleNamespace(
        proccess_pdb_file=lambda *_a, **_kw: None,
        # sin atributo 'study'
    )

    from apps.business_app.tasks import proccess_individual_processor_class

    with patch(
        "apps.business_app.tasks.SiteConfiguration.get_solo",
        return_value=SimpleNamespace(upload_to_drive=False),
    ), patch(
        "apps.business_app.tasks.XslxToPdbByAlleleStudy",
        return_value=processor_no_study,
    ) as mocked_cls, patch(
        "apps.business_app.tasks.send_pusher_trigger_task.delay"
    ) as mocked_pusher:
        mocked_cls.__name__ = "XslxToPdbByAlleleStudy"

        # No debe lanzar AttributeError
        proccess_individual_processor_class.run(
            "XslxToPdbByAlleleStudy", uploaded_file.id
        )

    mocked_pusher.assert_not_called()


@pytest.mark.django_db
def test_proccess_individual_processor_class_raises_value_error_for_unknown_processor(
    tmp_path, settings
):
    """La tarea lanza ValueError inmediatamente ante un nombre de clase desconocido."""
    settings.MEDIA_ROOT = tmp_path
    AllowedExtensions.objects.create(extension=".xlsx", typical_app_name="Excel")
    user = SystemUser.objects.create_user(
        username="ind_task_bad_cls", password="secret"
    )
    upload = SimpleUploadedFile(
        "ind_task_bad_cls.xlsx",
        b"fake excel bytes",
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    with patch(
        "apps.business_app.models.uploaded_files.proccess_individual_processor_class.apply_async"
    ):
        uploaded_file = UploadedFiles.objects.create(
            custom_name="Ind Task Bad Cls",
            original_file=upload,
            system_user=user,
        )

    from apps.business_app.tasks import proccess_individual_processor_class

    with patch(
        "apps.business_app.tasks.SiteConfiguration.get_solo",
        return_value=SimpleNamespace(upload_to_drive=False),
    ):
        with pytest.raises(ValueError, match="is not registered"):
            proccess_individual_processor_class.run(
                "NotARealProcessor", uploaded_file.id
            )
