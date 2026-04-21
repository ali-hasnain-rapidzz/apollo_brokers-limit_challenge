import django_filters

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    brokerId = django_filters.NumberFilter(field_name="broker_id")
    companySearch = django_filters.CharFilter(field_name="company__legal_name", lookup_expr="icontains")

    class Meta:
        model = models.Submission
        fields = ["status", "broker_id", "company__legal_name"]

