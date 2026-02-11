# mixins.py

# Этот миксин добавляет фильтрацию по текущему пользователю для всех запросов к queryset
class CurrentUserQuerysetMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)