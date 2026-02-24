from rest_framework.pagination import BasePagination
from rest_framework.response import Response
from django.core.paginator import Paginator

class FrontendPagination(BasePagination):
    page_size_query_param = 'rows'  # Количество элементов на странице
    page_query_param = 'first'      # Параметр для сдвига (offset)

    def paginate_queryset(self, queryset, request, view=None):
        # Получаем сдвиг (offset) и размер страницы (limit)
        first = int(request.query_params.get(self.page_query_param, 0))  # Сдвиг
        rows = int(request.query_params.get(self.page_size_query_param, 10))  # Количество объектов на странице

        # Создаем объект пагинатора с учетом сдвига и размера страницы
        paginator = Paginator(queryset, rows)
        
        # Определяем страницу, исходя из параметра first
        page_number = (first // rows) + 1
        self.page = paginator.get_page(page_number)  # Сохраняем страницу в self.page
        
        return self.page

    def get_paginated_response(self, data):
        return Response({
            'items': data,
            'total': self.page.paginator.count  # Используем 'total' для соответствия вашему формату
        })