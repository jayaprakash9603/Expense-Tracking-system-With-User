import React, { useEffect, useState } from "react";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileArchive,
  FaFileAlt,
  FaTimes,
  FaFilePowerpoint,
} from "react-icons/fa";
import { Button } from "@mui/material";
import {
  resetUploadState,
  uploadFile,
} from "../../Redux/Expenses/expense.action";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loaders/Loader";
import Modal from "../../pages/Landingpage/Modal"; // Updated import path for Modal component

const FileUploadModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const uploadState = useSelector((state) => state.fileUpload);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFiles = (newFiles) => {
    const file = newFiles[0];
    const allowedExtensions = ["xls", "xlsx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setPopupMessage("You can only upload Excel files.");
      setPopupOpen(true);
      return;
    }

    setFiles([file]);

    const progressBar = {};
    progressBar[file.name] = 0;
    setProgress(progressBar);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const updated = { ...prev };
        if (updated[file.name] < 100) {
          updated[file.name] += 10;
          return updated;
        } else {
          clearInterval(interval);
          return updated;
        }
      });
    }, 300);
  };

  const handleUploadClick = () => {
    if (!files.length) {
      alert("Please select a file.");
      return;
    }
    setLoading(true);
    dispatch(uploadFile(files[0]));
  };

  useEffect(() => {
    if (uploadState.success) {
      alert("Upload successful!");
      setLoading(false);
      setFiles([]);
      setProgress({});
      dispatch(resetUploadState());
      onClose();
    } else if (uploadState.error) {
      alert("Upload failed: " + uploadState.error);
      setLoading(false);
    }
  }, [uploadState, dispatch, onClose]);

  const handleRemoveFile = () => {
    setFiles([]);
    setProgress({});
  };

  const getFileIcon = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    const iconMap = {
      pdf: <FaFilePdf />,
      doc: <FaFileWord />,
      docx: <FaFileWord />,
      xls: <FaFileExcel />,
      xlsx: <FaFileExcel />,
      ppt: <FaFilePowerpoint />,
      pptx: <FaFilePowerpoint />,
      jpg: <FaFileImage />,
      jpeg: <FaFileImage />,
      png: <FaFileImage />,
      gif: <FaFileImage />,
      zip: <FaFileArchive />,
      rar: <FaFileArchive />,
      txt: <FaFileAlt />,
    };
    return iconMap[ext] || <FaFileAlt />;
  };

  const handleClose = () => {
    onClose();
    setFiles([]);
    setProgress({});
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 sm:p-2">
        <div className="bg-[#1b1b1b] text-white rounded-lg w-full max-w-2xl shadow-xl relative p-6 sm:p-4">
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>

          {/* Upload Area */}
          <label
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="block mt-4 p-6 m-[30px] border-2  border-[#14b8a6] rounded-lg bg-[#383838] text-center cursor-pointer  transition"
          >
            <input type="file" className="hidden" onChange={handleFileChange} />
            <div>
              <i className="fas fa-cloud-upload-alt text-4xl text-[#14b8a6] mb-3"></i>
              <p className="text-lg font-medium mb-1">Drag & drop file here</p>
              <p className="text-sm text-gray-400">or click to browse</p>
            </div>
          </label>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 bg-[#29282b] border border-[#383838] rounded-md mb-2 mx-auto"
                  style={{ maxWidth: "calc(100% - 60px)" }} // Adjusted width and centered the div
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#14b8a6] text-xl">
                      {getFileIcon(file)}
                    </span>
                    <span className="truncate max-w-full sm:max-w-full">
                      {file.name}
                    </span>
                  </div>
                  <FaTimes
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-600 cursor-pointer text-xl"
                  />
                </div>
              ))}
            </div>
          )}

          {loading && <Loader />}

          {/* Upload Button */}
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleUploadClick}
              variant="contained"
              disabled={loading}
              style={{
                backgroundColor: "#14b8a6",
                color: "#1b1b1b",
                fontWeight: "bold",
              }}
            >
              Upload
            </Button>
          </div>

          {/* Popup Modal for Unsupported Files */}
          <Modal
            isOpen={popupOpen}
            onClose={() => setPopupOpen(false)}
            title="Invalid File Type"
            confirmationText={popupMessage}
            onApprove={() => setPopupOpen(false)}
            approveText="OK"
          />
        </div>
      </div>
    )
  );
};

export default FileUploadModal;
