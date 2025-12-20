import { useState } from 'react';
import {
  Table,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Icon,
  Input,
  FlexBox,
  Toolbar,
  ToolbarSpacer,
  Title,
} from '@ui5/webcomponents-react';
import { ColumnConfig } from './types';

interface AdminTableProps {
  title: string;
  columns: ColumnConfig[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function AdminTable({
  title,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  canAdd = true,
  canEdit = true,
  canDelete = true,
}: AdminTableProps) {
  const [search, setSearch] = useState('');

  const filteredData = data.filter((item) =>
    columns.some((col) =>
      String(item[col.key] || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const renderCell = (item: any, column: ColumnConfig) => {
    const value = item[column.key];

    switch (column.type) {
      case 'icon':
        return <Icon name={`SAP-icons-v5/${value}`} />;
      case 'boolean':
        return (
          <Icon
            name={value ? 'SAP-icons-v5/accept' : 'SAP-icons-v5/decline'}
            style={{ color: value ? '#107e3e' : '#bb0000' }}
          />
        );
      case 'date':
        return value ? new Date(value).toLocaleDateString('fa-IR') : '-';
      default:
        return value ?? '-';
    }
  };

  return (
    <FlexBox direction="Column" style={{ height: '100%' }}>
      <Toolbar style={{ padding: '0.5rem 1rem', background: 'white' }}>
        <Title level="H5">{title}</Title>
        <ToolbarSpacer />
        <Input
          placeholder="Search..."
          value={search}
          onInput={(e: any) => setSearch(e.target.value)}
          icon={<Icon name="SAP-icons-v5/search" />}
          style={{ width: '250px' }}
        />
        {canAdd && (
          <Button icon="add" design="Emphasized" onClick={onAdd}>
            Add
          </Button>
        )}
      </Toolbar>

      <div style={{ flex: 1, overflow: 'auto', background: 'white' }}>
        <Table>
          {columns.map((col) => (
            <TableColumn key={col.key} slot="columns" style={{ width: col.width }}>
              {col.label}
            </TableColumn>
          ))}
          <TableColumn slot="columns" style={{ width: '100px' }}>
            Actions
          </TableColumn>

          {filteredData.map((item, index) => (
            <TableRow key={item.id || index}>
              {columns.map((col) => (
                <TableCell key={col.key}>{renderCell(item, col)}</TableCell>
              ))}
              <TableCell>
                <FlexBox style={{ gap: '0.25rem' }}>
                  {canEdit && (
                    <Button
                      icon="edit"
                      design="Transparent"
                      onClick={() => onEdit?.(item)}
                    />
                  )}
                  {canDelete && (
                    <Button
                      icon="delete"
                      design="Transparent"
                      onClick={() => onDelete?.(item)}
                    />
                  )}
                </FlexBox>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </FlexBox>
  );
}
