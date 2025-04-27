import React, { useState, useEffect } from "react";
import FileUploadModal from "../Fileupload/FileUploadModal";
import { useSelector } from "react-redux";
import DetailedExpensesTable from "../DetailedExpensesTable copy/DetailsExpensesTable";

const Upload = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(true);

  const {
    success = false,
    data = [],
    error = null,
  } = useSelector((state) => state.fileUpload || {});

  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    if (success && data?.length) {
      setUploadedData(data);
      setIsTableVisible(true);
    }
  }, [success, data]);

  const toggleTableVisibility = () => {
    setIsTableVisible(false);
  };

  const openUploadModal = () => {
    setModalOpen(true);
  };

  return (
    <div className="min-vh-100">
      <div className="card shadow w-100 position-relative">
        {uploadedData.length > 0 && isTableVisible ? (
          <div>
            {/* X button at top right */}
            <div className="position-relative d-flex justify-content-center">
              {/* Close button in top-right corner */}
              <button
                className="btn btn-sm btn-danger position-absolute"
                style={{ top: "30px", right: "200px", zIndex: 1 }}
                onClick={toggleTableVisibility}
                title="Close Table"
              >
                X
              </button>

              <div className="table-responsive" style={{ maxWidth: "90%" }}>
                <DetailedExpensesTable
                  data={uploadedData}
                  loading={false}
                  error={error}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "100vh" }}
          >
            <button
              className="btn btn-primary"
              onClick={openUploadModal}
              style={{ fontSize: "20px", padding: "15px 30px" }}
            >
              Upload Expense File
            </button>
          </div>
        )}

        <FileUploadModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </div>
  );
};

export default Upload;
