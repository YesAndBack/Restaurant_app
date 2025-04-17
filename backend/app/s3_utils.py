import asyncio
import boto3
import os
from uuid import uuid4
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor

# Загрузка переменных окружения
load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
AWS_S3_ENDPOINT_URL = os.getenv("AWS_S3_ENDPOINT_URL")

# Создание клиента boto3
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    endpoint_url=AWS_S3_ENDPOINT_URL
)


# Асинхронная функция загрузки файла в MinIO (S3)
async def upload_image_to_s3(file, folder="uploads"):
    """
    Загружает изображение в MinIO и возвращает публичный URL.
    """
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{folder}/{uuid4()}.{file_extension}"

    # Используем ThreadPoolExecutor для выполнения синхронного кода в фоне
    def upload():
        s3_client.upload_fileobj(
            file.file,
            AWS_S3_BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ACL": "public-read"}
        )

    # Запуск в отдельном потоке
    with ThreadPoolExecutor() as executor:
        await asyncio.get_event_loop().run_in_executor(executor, upload)

    return f"{AWS_S3_ENDPOINT_URL}/{AWS_S3_BUCKET_NAME}/{unique_filename}"
