import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, PillToggle, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/lib/api';
import { pickDutyAttachment } from '@/lib/attachment-picker';
import type { AttachmentUpload, Duty, DutyInput } from '@/lib/duties';

export type DutyFormProps = {
  initial?: Duty;
  onSubmit: (input: DutyInput) => Promise<void>;
  onCancel: () => void;
};

export function DutyForm({ initial, onSubmit, onCancel }: DutyFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [direction, setDirection] = useState<'ASC' | 'DESC'>(initial?.direction ?? 'ASC');
  const [attachment, setAttachment] = useState<AttachmentUpload | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingAttachment = removeAttachment ? null : (initial?.attachment ?? null);
  const hasAttachment = Boolean(attachment || existingAttachment);

  const onPickAttachment = async () => {
    try {
      const picked = await pickDutyAttachment();
      if (picked) {
        setAttachment(picked);
        setRemoveAttachment(false);
      }
    } catch {
      setError('Some error occurred.');
    }
  };

  const onSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        name,
        description,
        direction,
        attachment: attachment ?? undefined,
        removeAttachment: !attachment && removeAttachment ? true : undefined,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Some error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={styles.card}>
      <TextField label="NAME" placeholder="Duty name" value={name} onChangeText={setName} />
      <TextField
        label="DESCRIPTION"
        placeholder="What does this duty involve?"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View>
        <ThemedText type="label">ROTATION DIRECTION</ThemedText>
        <View style={styles.pillWrap}>
          <PillToggle
            options={[
              { value: 'ASC', label: '↺ Anti-CW' },
              { value: 'DESC', label: '↻ CW' },
            ]}
            value={direction}
            onChange={setDirection}
          />
        </View>
      </View>

      <View>
        <ThemedText type="label">ATTACHMENT</ThemedText>
        {attachment ? (
          attachment.mimeType.startsWith('image/') ? (
            <Image
              source={{ uri: `data:${attachment.mimeType};base64,${attachment.base64}` }}
              style={styles.preview}
              contentFit="cover"
            />
          ) : (
            <ThemedText type="bodyMuted" style={styles.attachmentName}>
              {attachment.fileName}
            </ThemedText>
          )
        ) : existingAttachment ? (
          <ThemedText type="bodyMuted" style={styles.attachmentName}>
            {existingAttachment.fileName}
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="textFaint" style={styles.attachmentName}>
            No attachment
          </ThemedText>
        )}
        <View style={styles.row}>
          <Button
            label={hasAttachment ? 'Replace' : 'Add attachment'}
            variant="secondary"
            flex
            onPress={onPickAttachment}
          />
          {hasAttachment ? (
            <Button
              label="Remove"
              variant="danger"
              flex
              onPress={() => {
                setAttachment(null);
                setRemoveAttachment(true);
              }}
            />
          ) : null}
        </View>
      </View>

      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}

      <View style={styles.row}>
        <Button label="Cancel" variant="ghost" flex onPress={onCancel} />
        <Button label="Save" variant="primary" flex loading={saving} onPress={onSave} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  pillWrap: {
    marginTop: Spacing.one,
  },
  attachmentName: {
    marginTop: Spacing.one,
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginTop: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
