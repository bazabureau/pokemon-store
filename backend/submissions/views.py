from rest_framework import permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CardSubmission, SubmissionImage
from .serializers import CardSubmissionSerializer


class CardSubmissionCreateView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = CardSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        submission = serializer.save(
            user=request.user if request.user.is_authenticated else None
        )

        # Handle uploaded images (up to 4)
        images = request.FILES.getlist("images")
        for img in images[:4]:
            SubmissionImage.objects.create(submission=submission, image=img)

        # Send confirmation email
        from config.email_utils import send_submission_confirmation
        send_submission_confirmation(submission)

        return Response(
            CardSubmissionSerializer(submission).data,
            status=status.HTTP_201_CREATED,
        )
