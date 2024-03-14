import { useCallback, useEffect, useRef, useState } from 'react';

import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  RedoOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  FileOutlined,
  FilterOutlined,
  FilterTwoTone,
} from '@ant-design/icons';
import { Dropdown, Table, Button, Input, Form, Row, Col, Tooltip, Space } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { dataForTable } from '@/utils/dataStructure';
import { useMoney, useDate } from '@/settings';

import { generate as uniqueId } from 'shortid';

import { useCrudContext } from '@/context/crud';
import { selectLangDirection } from '@/redux/translate/selectors';
import { ProTable } from '@ant-design/pro-components';

function AddNewItem({ config }) {
  const { crudContextAction } = useCrudContext();
  const { collapsedBox, panel } = crudContextAction;
  const { ADD_NEW_ENTITY } = config;

  const handelClick = () => {
    panel.open();
    collapsedBox.close();
  };

  return (
    <Button onClick={handelClick} type="primary">
      {ADD_NEW_ENTITY}
    </Button>
  );
}
export default function DataTable({ config, extra = [] }) {
  let { entity, dataTableColumns, DATATABLE_TITLE, fields, searchConfig } = config;
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, modal, readBox, editBox, advancedBox } = crudContextAction;
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

  const items = [
    {
      label: translate('Show'),
      key: 'read',
      icon: <EyeOutlined />,
    },
    {
      label: translate('Edit'),
      key: 'edit',
      icon: <EditOutlined />,
    },
    ...extra,
    {
      type: 'divider',
    },

    {
      label: translate('Delete'),
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];

  const handleRead = (record) => {
    dispatch(crud.currentItem({ data: record }));
    panel.open();
    collapsedBox.open();
    readBox.open();
  };
  function handleEdit(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    editBox.open();
    panel.open();
    collapsedBox.open();
  }
  function handleDelete(record) {
    dispatch(crud.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  }

  function handleUpdatePassword(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    advancedBox.open();
    panel.open();
    collapsedBox.open();
  }

  let dispatchColumns = [];
  if (fields) {
    dispatchColumns = [...dataForTable({ fields, translate, moneyFormatter, dateFormat })];
  } else {
    dispatchColumns = [...dataTableColumns];
  }

  dataTableColumns = [
    ...dispatchColumns,
    {
      title: '',
      key: 'action',
      hideInSearch: true,
      width: 50,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              switch (key) {
                case 'read':
                  handleRead(record);
                  break;
                case 'edit':
                  handleEdit(record);
                  break;

                case 'delete':
                  handleDelete(record);
                  break;
                case 'updatePassword':
                  handleUpdatePassword(record);
                  break;

                default:
                  break;
              }
              // else if (key === '2')handleCloseTask
            },
          }}
          trigger={['click']}
        >
          <EllipsisOutlined
            style={{ cursor: 'pointer', fontSize: '24px' }}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items: dataSource } = listResult;

  const dispatch = useDispatch();

  const handelDataTableLoad = useCallback((pagination) => {
    const options = { page: pagination.current || 1, items: pagination.pageSize || 10 };
    dispatch(crud.list({ entity, options }));
  }, []);

  const filterTable = (e) => {
    const value = e.target.value;
    const options = {
      q: value,
      fields: searchConfig?.searchFields || '',
      populatedFields: searchConfig.populatedFields || [],
    };
    dispatch(crud.list({ entity, options }));
  };
  const searchTable = (e) => {
    const options = {
      filter: JSON.stringify(e),
    };
    dispatch(crud.list({ entity, options }));
  };

  const dispatcher = () => {
    dispatch(crud.list({ entity }));
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  const langDirection = useSelector(selectLangDirection);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  return (
    <>
      <PageHeader
        onBack={() => window.history.back()}
        backIcon={langDirection === 'rtl' ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
        title={DATATABLE_TITLE}
        ghost={false}
        extra={[
          <Input
            key={`searchFilterDataTable}`}
            onChange={filterTable}
            placeholder={translate('search')}
            allowClear
          />,
          <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<RedoOutlined />}>
            {translate('Refresh')}
          </Button>,

          <AddNewItem key={`${uniqueId()}`} config={config} />,
        ]}
        style={{
          padding: '1px 0px',
          direction: langDirection,
        }}
      ></PageHeader>

      <ProTable
        formRef={ref}
        size="small"
        // loading={l}
        columns={dataTableColumns}
        rowKey={(item) => item._id}
        dataSource={dataSource}
        pagination={pagination}
        loading={listIsLoading}
        search={open}
        filter={open}
        // toolBarRender={false}
        onChange={handelDataTableLoad}
        scroll={{ x: true }}
        toolBarRender={(a, e) => (
          <Space wrap>
            <Tooltip title={open ? 'Clear Filters' : 'Show Filters'}>
              <Button
                type="primary"
                ghost
                size='small'
                key={'reset'}
                onClick={() => setOpen(!open)}
                icon={open ? <FilterTwoTone /> : <FilterOutlined />}
              />
            </Tooltip>
          </Space>
        )}
        // search={{
        //   defaultCollapsed: false,
        //   optionRender: (searchConfig, formProps, dom) => [
        //     // ...dom.reverse(),
        //     <Button
        //       key="out"
        //       onClick={() => {
        //         const values = searchConfig?.form?.getFieldsValue();
        //         const nonEmptyValues = Object.fromEntries(
        //           Object.entries(values || {}).filter(
        //             ([key, value]) => value !== '' && value !== undefined
        //           )
        //         );
        //         console.log(nonEmptyValues);
        //         searchTable(nonEmptyValues);
        //       }}
        //     >
        //       Search
        //     </Button>,
        //   ],
        // }}
        request={async (params, { sort, filter }) => {
          delete params.current;
          delete params.pageSize;
          const options = {
            page: params.current || 1,
            items: params.pageSize || 10,
          };
          const nonEmptyValues = Object.fromEntries(
            Object.entries(params || {}).filter(
              ([key, value]) => value !== '' && value !== undefined
            )
          );
          if (Object.keys(nonEmptyValues).length > 0) {
            options.filter = JSON.stringify({ ...nonEmptyValues });
          }

          dispatch(crud.list({ entity, options }));
          return {
            data: dataSource, // Pass the data to ProTable
            success: true,
            total: pagination.total || 0, // Pass the total count to ProTable
          };
        }}
        // params={{ keyword: '', ...config.searchConfig?.defaultValues }} // Set initial filter values
      />
    </>
  );
}
