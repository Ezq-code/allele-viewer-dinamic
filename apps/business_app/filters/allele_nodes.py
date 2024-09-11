# class AlleleNodeFilter(filters.FilterSet):
#     # children_qty = filters.NumberFilter(field_name="children", lookup_expr="gte")

#     class Meta:
#         model = AlleleNode
#         # fields = ["uploaded_file", "children_qty"]
#         fields = {
#             "uploaded_file": [
#                 "exact",
#             ],
#             "children_qty": ["exact", "gte"],
#         }
