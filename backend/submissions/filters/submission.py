import django_filters

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    brokerId = django_filters.NumberFilter(field_name="broker_id")
    companySearch = django_filters.CharFilter(field_name="company__legal_name", lookup_expr="icontains")
    createdFrom = django_filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    createdTo = django_filters.DateFilter(field_name="created_at", lookup_expr="date__lte")
    hasDocuments = django_filters.BooleanFilter(method="filter_has_documents")
    hasNotes = django_filters.BooleanFilter(method="filter_has_notes")

    def filter_has_documents(self, queryset, name, value):
        if value:
            return queryset.filter(documents__isnull=False).distinct()
        return queryset.filter(documents__isnull=True)

    def filter_has_notes(self, queryset, name, value):
        if value:
            return queryset.filter(notes__isnull=False).distinct()
        return queryset.filter(notes__isnull=True)

    class Meta:
        model = models.Submission
        fields = ["status", "broker_id", "company__legal_name"]

