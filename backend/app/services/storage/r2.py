from typing import Optional
import boto3
from botocore.exceptions import ClientError
from app.services.storage.base import StorageService
from app.config import settings


class R2Storage(StorageService):
    def __init__(self):
        self.bucket = settings.R2_BUCKET_NAME
        self.public_url = settings.R2_PUBLIC_URL.rstrip("/") if settings.R2_PUBLIC_URL else ""
        endpoint_url = f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com" if settings.R2_ACCOUNT_ID else None

        self.s3_client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name="auto"
        )

    def save_file(self, file_data: bytes, destination_rel_path: str) -> str:
        key = destination_rel_path.lstrip("/")
        self.s3_client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=file_data
        )
        return self.get_url(destination_rel_path)

    def atomic_write(self, content: str, filename: str) -> str:
        # In S3/R2 put_object is inherently atomic per key
        key = filename.lstrip("/")
        self.s3_client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=content.encode("utf-8"),
            ContentType="application/json"
        )
        return self.get_url(filename)

    def get_file(self, filename: str) -> Optional[bytes]:
        key = filename.lstrip("/")
        try:
            res = self.s3_client.get_object(Bucket=self.bucket, Key=key)
            return res["Body"].read()
        except ClientError:
            return None

    def delete_file(self, destination_rel_path: str) -> bool:
        key = destination_rel_path.lstrip("/")
        try:
            self.s3_client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError:
            return False

    def get_url(self, destination_rel_path: str) -> str:
        key = destination_rel_path.lstrip("/")
        if self.public_url:
            return f"{self.public_url}/{key}"
        return f"https://{self.bucket}.r2.cloudflarestorage.com/{key}"
