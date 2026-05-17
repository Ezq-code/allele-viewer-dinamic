from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from apps.business_app.models.gene import Gene
from apps.business_app.models.gene_status_middle import GeneStatusMiddle
from apps.business_app.utils.gene_list_cache import bump_gene_list_cache_version


@receiver(post_save, sender=Gene)
def invalidate_gene_list_cache_on_gene_save(sender, instance, **kwargs):
    bump_gene_list_cache_version()


@receiver(post_delete, sender=Gene)
def invalidate_gene_list_cache_on_gene_delete(sender, instance, **kwargs):
    bump_gene_list_cache_version()


@receiver(post_delete, sender=GeneStatusMiddle)
def invalidate_gene_list_cache_on_gene_status_middle_delete(sender, instance, **kwargs):
    bump_gene_list_cache_version()


@receiver(m2m_changed, sender=Gene.groups.through)
def invalidate_gene_list_cache_on_groups_changed(sender, instance, action, **kwargs):
    if action in {"post_add", "post_remove", "post_clear"}:
        bump_gene_list_cache_version()


@receiver(m2m_changed, sender=Gene.disorders.through)
def invalidate_gene_list_cache_on_disorders_changed(sender, instance, action, **kwargs):
    if action in {"post_add", "post_remove", "post_clear"}:
        bump_gene_list_cache_version()
