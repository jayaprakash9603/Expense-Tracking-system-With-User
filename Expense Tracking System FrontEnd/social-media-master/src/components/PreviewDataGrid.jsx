import React from "react";
import { Box, Button } from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";

const PreviewToolbar = () => (
  <GridToolbarContainer sx={{ display: "flex", gap: 1, p: 1 }}>
    <GridToolbarQuickFilter
      sx={{
        fontSize: "0.875rem",
        "& .MuiInputBase-root": {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
          borderRadius: "8px",
        },
        "& .MuiInputBase-input::placeholder": {
          color: "#666666",
        },
      }}
    />
  </GridToolbarContainer>
);

const PreviewDataGrid = ({
  rows = [],
  columns = [],
  getRowId,
  onCancel,
  onSave,
  saveDisabled = false,
  saveLabel = "Save",
  height = 700,
  marginTop = 50,
  pageSizeOptions = [10, 15, 20],
  editMode = "cell",
  onCellEditCommit,
}) => {
  return (
    <div className="relative">
      <Box sx={{ height, width: "100%", mt: `${marginTop}px` }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId || ((row) => row.id)}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: pageSizeOptions[0] || 10 },
            },
          }}
          pageSizeOptions={pageSizeOptions}
          rowHeight={53}
          headerHeight={40}
          disableRowSelectionOnClick
          slots={{ toolbar: PreviewToolbar }}
          autoHeight={false}
          editMode={editMode}
          onCellEditCommit={onCellEditCommit}
        />
      </Box>

      <div className="flex flex-col sm:flex-row justify-between gap-2 mt-[10px]">
        <button
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 z-10"
          onClick={onCancel}
          title="Close Table"
        >
          Cancel
        </button>
        {onSave ? (
          <Button
            variant="contained"
            disabled={saveDisabled}
            onClick={onSave}
            sx={{ bgcolor: saveDisabled ? "#555" : "#1976d2" }}
          >
            {saveLabel}
          </Button>
        ) : (
          <Button variant="contained" disabled sx={{ bgcolor: "#555" }}>
            {saveLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PreviewDataGrid;
