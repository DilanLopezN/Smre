import { DeleteOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Modal, Space } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { UserRoles } from '~/constants/user-roles';
import { useAuth } from '~/hooks/use-auth';
import { localeKeys } from '~/i18n';
import { Tag } from '~/interfaces/tag';
import { notifyError } from '~/utils/notify-error';
import { notifySuccess } from '~/utils/notify-success';
import { useDeleteTag } from '../../hooks/use-delete-tag/use-delete-tag';
import { useGetTags } from '../../hooks/use-get-tags/use-get-tags';
import { useUpdateTag } from '../../hooks/use-update-tag/use-update-tag';
import { DeleteConfirmModal } from '../delete-confirm-modal/delete-confirm-modal';
import { TagFormContent } from '../tag-form-content/tag-form-content';
import { TagFormModalProps, TagFormValues } from './interfaces';

export const TagFormModal = ({ tagId, visible, onClose, onSaved }: TagFormModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form] = Form.useForm<TagFormValues>();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();

  const { tags, isFetchingTags, fetchTagsError, fetchTags } = useGetTags();
  const { updateTag, isUpdating: isSaving } = useUpdateTag();
  const { deleteTag, isDeleting } = useDeleteTag();

  const tagFormModalLocaleKeys = localeKeys.settings.tags.components.tagFormModal;
  const isSystemAdmin = user?.roles?.some((roles) => roles.role === UserRoles.SYSTEM_ADMIN);
  const currentTag = tags && tags.data.find((tag) => tag._id === tagId);
  const tagName = currentTag?.name || t(tagFormModalLocaleKeys.tagLabel);

  const handleSubmit = useCallback(
    async (values: TagFormValues) => {
      const tagDataToUpdate: Tag = {
        _id: tagId,
        name: values.name.trim(),
        color: selectedColor || undefined,
        workspaceId,
        inactive: !values.active,
      };

      const result = await updateTag(tagDataToUpdate);

      if (result) {
        notifySuccess({
          message: t(tagFormModalLocaleKeys.updateSuccessTitle),
          description: t(tagFormModalLocaleKeys.updateSuccessMessage),
        });
        onSaved();
        onClose();
      } else {
        notifyError(t(tagFormModalLocaleKeys.updateTagError));
      }
    },
    [
      tagId,
      selectedColor,
      workspaceId,
      updateTag,
      t,
      tagFormModalLocaleKeys.updateSuccessTitle,
      tagFormModalLocaleKeys.updateSuccessMessage,
      tagFormModalLocaleKeys.updateTagError,
      onSaved,
      onClose,
    ]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!tagId) return;
    setShowDeleteConfirm(true);
  }, [tagId]);

  const handleConfirmDelete = useCallback(async () => {
    if (!tagId) return;

    const success = await deleteTag(tagId);
    setShowDeleteConfirm(false);

    if (success) {
      notifySuccess({
        message: t(tagFormModalLocaleKeys.deleteSuccessTitle),
        description: t(tagFormModalLocaleKeys.deleteSuccessMessage),
      });
      onSaved();
      onClose();
    }
  }, [tagId, deleteTag, onSaved, onClose, t, tagFormModalLocaleKeys]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  useEffect(() => {
    if (fetchTagsError) {
      notifyError(t(tagFormModalLocaleKeys.descriptionError));
    }
  }, [
    fetchTagsError,
    t,
    tagFormModalLocaleKeys.descriptionError,
    tagFormModalLocaleKeys.messageError,
  ]);

  useEffect(() => {
    if (visible) {
      form.resetFields();

      if (!tagId) {
        setSelectedColor('');
      }
      fetchTags();
    }
  }, [visible, form, fetchTags, tagId]);

  useEffect(() => {
    if (visible && tagId && tags && tags.data.length > 0) {
      const current = tags.data.find((tag) => tag._id === tagId);
      if (current) {
        form.setFieldsValue({ name: current.name, active: !current.inactive });
        setSelectedColor(current.color || '');
      } else {
        form.resetFields();
        form.setFieldsValue({ name: '', active: true });
        setSelectedColor('');
        if (tagId) {
          notifyError(t(tagFormModalLocaleKeys.tagNotFound));
        }
      }
    } else if (visible && !tagId) {
      form.resetFields();
      form.setFieldsValue({ name: '', active: true });
      setSelectedColor('');
    }
  }, [visible, tagId, tags, form, t, tagFormModalLocaleKeys.tagNotFound]);

  const renderModalFooter = () => (
    <Space
      style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
      align='center'
    >
      {tagId && (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleDeleteConfirm}
          loading={isDeleting}
          disabled={isSaving}
          aria-label={t(tagFormModalLocaleKeys.deleteButtonAriaLabel)}
        >
          {t(tagFormModalLocaleKeys.deleteButton)}
        </Button>
      )}

      <Space size={8}>
        <Button onClick={onClose} disabled={isSaving || isDeleting}>
          {t(tagFormModalLocaleKeys.cancelButton)}
        </Button>
        <Button
          type='primary'
          onClick={() => form.submit()}
          loading={isSaving}
          disabled={isDeleting || isFetchingTags}
        >
          {t(tagFormModalLocaleKeys.saveButton)}
        </Button>
      </Space>
    </Space>
  );

  return (
    <>
      <Modal
        open={visible}
        title={t(tagFormModalLocaleKeys.pageHeader)}
        onCancel={onClose}
        onOk={() => form.submit()}
        okText={t(tagFormModalLocaleKeys.saveButton)}
        confirmLoading={isSaving}
        destroyOnClose
        footer={renderModalFooter()}
      >
        <Divider />
        <TagFormContent
          form={form}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          isSystemAdmin={!isSystemAdmin}
          isSaving={isSaving}
          isDeleting={isDeleting}
          isFetchingTags={isFetchingTags}
          onFinish={handleSubmit}
        />
      </Modal>
      <DeleteConfirmModal
        visible={showDeleteConfirm}
        tagName={tagName}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};
