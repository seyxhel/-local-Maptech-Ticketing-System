from drf_yasg.inspectors import SwaggerAutoSchema


class TaggedAutoSchema(SwaggerAutoSchema):
    """Custom schema class that reads ``swagger_tags`` from the view."""

    def get_tags(self, operation_keys=None):
        # 1. Per-endpoint override via @swagger_auto_schema(tags=[...])
        tags = self.overrides.get('tags')
        if tags:
            return tags

        # 2. ViewSet-level swagger_tags attribute
        tags = getattr(self.view, 'swagger_tags', None)
        if tags:
            return tags

        # 3. Default: use first URL component (fallback)
        return super().get_tags(operation_keys)
