class CurrentUserQuerysetMixin:
    """Добавляет фильтрацию по текущему пользователю для всех запросов к queryset"""
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)