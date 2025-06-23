import { RedoOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Row, Space, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { debounce } from 'lodash';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Link, useParams } from 'react-router-dom';
import { EnhancedTable } from '~/components/enhanced-table';
import { PageTemplate } from '~/components/page-template';
import { localeKeys } from '~/i18n';
import type { Tag } from '~/interfaces/tag';
import { routes } from '~/routes';
import { notifyError } from '~/utils/notify-error';
import { TagFormModal } from '../../components/tag-form-modal/tag-form-modal';
import { useGetTags } from '../../hooks/use-get-tags/use-get-tags';

import { InactiveStatusText, SearchInput, TagCellContent, TagColorBar, TagName } from './styles';

const { Title } = Typography;

export const TagsList = () => {
  const { t } = useTranslation();
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [searchInputValue, setSearchInputValue] = useState<string>('');
  const [debouncedSearchInputValue, setDebouncedSearchInputValue] = useState<string>('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { tags, isFetchingTags, fetchTagsError, fetchTags } = useGetTags({
    currentPage,
    pageSize,
    search: debouncedSearchInputValue,
  });

  const tagsListLocaleKeys = localeKeys.settings.tags.pages.tagsListPage;
  const { children: tagModules } = routes.modules.children.settings.children.tags;
  const createNewTagPath = generatePath(tagModules.createTag.fullPath, { workspaceId });

  const searchDebounceHandler = useRef(
    debounce((searchTerm: string) => {
      setDebouncedSearchInputValue(searchTerm);
    }, 300)
  ).current;

  const renderPaginationTotal = (totalItems: number) =>
    `${totalItems} ${t(
      totalItems > 1 ? tagsListLocaleKeys.totalUsersTable : tagsListLocaleKeys.totalUserTable
    )}`;

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setSearchInputValue(inputValue);
    searchDebounceHandler(inputValue);
  };

  const handlePageChange = (pageNumber: number, pageSizeValue: number) => {
    setCurrentPage(pageNumber);
    setPageSize(pageSizeValue);
  };

  const handleOpenEditModal = useCallback((tagId: string) => setEditingTagId(tagId), []);

  const handleCloseEditModal = useCallback(() => setEditingTagId(null), []);

  const handleTagSaved = useCallback(() => {
    fetchTags();
    handleCloseEditModal();
  }, [fetchTags, handleCloseEditModal]);

  useEffect(() => {
    if (fetchTagsError) {
      const typedError = fetchTagsError;
      notifyError(typedError.message);
    }
  }, [fetchTagsError, t]);

  const tableColumns: ColumnsType<Tag> = [
    {
      title: t(tagsListLocaleKeys.tableTitle),
      dataIndex: 'name',
      key: 'name',
      onCell: () => ({ style: { paddingLeft: 0 } }),
      render: (_, tagRecord) => {
        const isInactive = !!tagRecord.inactive;
        return (
          <TagCellContent>
            <TagColorBar tagColor={tagRecord.color ?? ''} isInactive={isInactive} />
            <TagName isInactive={isInactive}>
              {tagRecord.name}
              {isInactive && (
                <InactiveStatusText>({t(tagsListLocaleKeys.statusInactive)})</InactiveStatusText>
              )}
            </TagName>
          </TagCellContent>
        );
      },
    },
  ];

  const renderActionButtons = () => (
    <Space>
      <Link to={createNewTagPath}>
        <Button type='primary'>{t(tagsListLocaleKeys.addTagButton)}</Button>
      </Link>
    </Space>
  );

  const renderTableControls = () => (
    <Flex justify='space-between' align='center' wrap='wrap'>
      <Title level={5} style={{ margin: 0, fontWeight: 'normal' }}>
        {t(tagsListLocaleKeys.pageTitle)}
      </Title>
      <Space wrap>
        <SearchInput
          value={searchInputValue}
          onChange={handleSearchInputChange}
          placeholder={t(tagsListLocaleKeys.searchInputPlaceholder)}
          allowClear
        />
        <Button icon={<RedoOutlined />} onClick={() => fetchTags()} disabled={isFetchingTags}>
          {t(tagsListLocaleKeys.refreshButton)}
        </Button>
      </Space>
    </Flex>
  );

  const renderTable = () => (
    <EnhancedTable
      columns={tableColumns}
      dataSource={tags?.data}
      loading={isFetchingTags}
      bordered
      pagination={{
        total: tags?.count,
        current: currentPage,
        pageSize,
        onChange: handlePageChange,
        showTotal: renderPaginationTotal,
      }}
      scroll={{ y: 'calc(100vh - 296px)', x: 664 }}
      onRow={(tagRecord) => ({
        onClick: () => handleOpenEditModal(tagRecord._id),
        style: { cursor: 'pointer' },
      })}
    />
  );

  const renderModal = () =>
    editingTagId !== null &&
    workspaceId && (
      <TagFormModal
        workspaceId={workspaceId}
        tagId={editingTagId}
        visible
        onClose={handleCloseEditModal}
        onSaved={handleTagSaved}
      />
    );

  return (
    <>
      <PageTemplate title={t(tagsListLocaleKeys.pageHeader)} actionButtons={renderActionButtons()}>
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>{renderTableControls()}</Col>
            <Col span={24}>{renderTable()}</Col>
          </Row>
        </Card>
      </PageTemplate>

      {renderModal()}
    </>
  );
};
