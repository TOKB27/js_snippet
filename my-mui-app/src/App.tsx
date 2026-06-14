import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid'; // ← type を追加して別行にする

// 1. 列の定義（テーブルのヘッダー部分）
// TypeScriptの型「GridColDef」を適用することで、安全に列を定義できます。
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'firstName', headerName: '名', width: 150 },
  { field: 'lastName', headerName: '姓', width: 150 },
  { field: 'age', headerName: '年齢', type: 'number', width: 110 },
];

// 2. 行のデータ（API等から取得することを想定したデータ部分）
// ※ DataGridの仕様上、各オブジェクトに必ず一意の「id」プロパティが必要です。
const rows = [
  { id: 1, lastName: '山田', firstName: '太郎', age: 35 },
  { id: 2, lastName: '佐藤', firstName: '花子', age: 28 },
  { id: 3, lastName: '鈴木', firstName: '一郎', age: 42 },
];

function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        p: 3 // パディングを追加
      }}
    >
      {/* DataGrid を配置。
        親要素（ここではBoxや、この下のdiv）に高さ（height）と幅（width）を
        指定しないと表示されない仕様になっているため、sxで指定しています。
      */}
      <Box sx={{ height: 300, width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection // 行のチェックボックス選択機能を有効化
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}

export default App