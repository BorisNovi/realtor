class CurrentUserQuerysetMixin:
    """Добавляет фильтрацию по текущему пользователю для всех запросов к queryset"""
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)
    
# Эта штука вынесена сюда для использования вне вьюзов. 
# По сути своей дублирует билд кверисета, которая выше.  
def filter_by_user(qs, user):
    """Фильтрует переданный queryset в зависимости от прав пользователя, но вне вьюзов."""
    if user.is_staff:
        return qs
    return qs.filter(user=user)