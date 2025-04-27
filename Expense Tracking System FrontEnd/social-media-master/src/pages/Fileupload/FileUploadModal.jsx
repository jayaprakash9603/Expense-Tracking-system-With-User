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
import "./FileUploadModal.css";
import { Button } from "@mui/material";
import {
  resetUploadState,
  uploadFile,
} from "../../Redux/Expenses/expense.action";

import { useDispatch, useSelector } from "react-redux";

// Assume Loader is a component that you already have
import Loader from "../../components/Loaders/Loader"; // You can replace this with your actual Loader component

const FileUploadModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false); // Loading state to manage loader visibility
  const uploadState = useSelector((state) => state.fileUpload);

  const dispatch = useDispatch();

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    e.target.value = ""; // Reset input
  };

  // Handle dropped files
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  // Only keep one file, replace if user uploads another
  const handleFiles = (newFiles) => {
    const file = newFiles[0];
    setFiles([file]);

    const progressBar = {};
    progressBar[file.name] = 0;
    setProgress(progressBar);

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = { ...prevProgress };
        if (newProgress[file.name] < 100) {
          newProgress[file.name] += 10;
          return newProgress;
        } else {
          clearInterval(interval);
          return newProgress;
        }
      });
    }, 300);
  };

  // Upload to backend with JWT
  const handleUploadClick = () => {
    if (!files.length) {
      alert("Please select a file.");
      return;
    }

    setLoading(true); // Set loading to true to show the loader
    dispatch(uploadFile(files[0])); // Dispatch the file upload
  };

  useEffect(() => {
    if (uploadState.success) {
      alert("Upload successful!");
      setLoading(false); // Hide the loader on success
      setFiles([]); // Clear the file details
      setProgress({}); // Clear the progress
      dispatch(resetUploadState()); // Reset upload state after success
      onClose(); // Close the modal on success
    } else if (uploadState.error) {
      alert("Upload failed: " + uploadState.error);
      setLoading(false); // Hide the loader on error
    }
  }, [uploadState, dispatch, onClose]);

  const handleRemoveFile = (fileName) => {
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
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <button className="close-button" onClick={handleClose}>
              <FaTimes />
            </button>
          </div>
          <div className="file-upload-wrapper">
            <label className="file-upload-box mb-0">
              <input
                type="file"
                className="file-upload-input"
                onChange={handleFileChange}
                onDrop={handleDrop}
              />
              <div className="upload-content">
                <i className="fas fa-cloud-upload-alt upload-icon"></i>
                <h5 className="mb-2">Drag & Drop file here</h5>
                <p className="text-muted mb-0">or click to browse</p>
              </div>
            </label>

            <div className="file-list-container">
              <div className="file-list">
                {files.map((file) => (
                  <div className="file-item" key={file.name}>
                    <div className="file-icon">{getFileIcon(file)}</div>
                    <span className="file-name" title={file.name}>
                      {file.name}
                    </span>
                    <FaTimes
                      className="remove-file"
                      onClick={() => handleRemoveFile(file.name)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Conditionally render the loader */}
            {loading && <Loader />}

            <div className="modal-footer">
              <Button
                variant="contained"
                color="primary"
                onClick={handleUploadClick}
                disabled={loading} // Disable the button while uploading
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default FileUploadModal;
