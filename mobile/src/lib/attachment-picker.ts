import * as DocumentPicker from 'expo-document-picker';
import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';

import type { AttachmentUpload } from '@/lib/duties';

export async function pickDutyAttachment(): Promise<AttachmentUpload | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['image/*', 'application/pdf'],
    copyToCacheDirectory: true,
  });
  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? 'application/octet-stream';
  const base64 = asset.base64 ?? (await readAsStringAsync(asset.uri, { encoding: EncodingType.Base64 }));

  return { base64, fileName: asset.name, mimeType };
}
