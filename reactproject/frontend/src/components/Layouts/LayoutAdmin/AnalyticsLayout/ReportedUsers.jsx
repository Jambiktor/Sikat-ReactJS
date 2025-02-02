import React, { useState, useEffect } from "react";
import Pagination from "react-bootstrap/Pagination";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import axios from "axios";
import { Link } from "react-router-dom";
import MessageModal from "../../DiaryEntry/messageModal";
import MessageAlert from "../../DiaryEntry/messageAlert";
import ReportedUsersDownloadButton from "../../DownloadButton/ReportedUsersDownloadButton";

const ReportedComment = ({ reportedUsers }) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [option, setOption] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [modal, setModal] = useState({ show: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const closeModal = () => {
    setModal({ show: false, message: "" });
  };
  const closeConfirmModal = () => {
    setConfirmModal({
      show: false,
      message: "",
      onConfirm: () => {},
      onCancel: () => {},
    });
  };

  useEffect(() => {
    const fetchReportComments = async () => {
      try {
        const response = await axios.get("http://localhost:8081/reportUsers");
        setOption(response.data);
      } catch (error) {
        console.error("Error fetching alarming words:", error);
      }
    };

    fetchReportComments();
  }, []);

  useEffect(() => {
    const applyFilter = () => {
      let filtered = reportedUsers;

      if (selectedSubject !== "All") {
        filtered = filtered.filter((reportedUser) =>
          reportedUser.reason
            .toLowerCase()
            .includes(selectedSubject.toLowerCase())
        );
      }

      if (searchQuery.trim() !== "") {
        filtered = filtered.filter(
          (reportedUser) =>
            reportedUser.firstName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            reportedUser.lastName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            reportedUser.reason
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            reportedUser.studentNumber.toString().includes(searchQuery)
        );
      }

      setFilteredUsers(filtered);
      setCurrentPage(1);
    };

    applyFilter();
  }, [reportedUsers, selectedSubject, searchQuery]);

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handlers
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrevClick = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleAddressed = async (reportedUsersID) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to mark this user as reviewed?`,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await axios.put(
            `http://localhost:8081/reportingUsersAddress/${reportedUsersID}`
          );
          closeConfirmModal();
          setModal({
            show: true,
            message: `The user has been reviewed.`,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error("Failed to update user:", error);
          setModal({
            show: true,
            message: `Failed to update the user. Please try again.`,
          });
        } finally {
          setIsLoading(false);
        }
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
  };

  return (
    <div className="d-flex flex-column">
      <MessageAlert
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageAlert>
      <MessageModal
        showModal={confirmModal}
        closeModal={closeConfirmModal}
        title={"Confirmation"}
        message={confirmModal.message}
        confirm={confirmModal.onConfirm}
        needConfirm={1}
      ></MessageModal>

      <div>
        <div>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">
              <i className="bx bx-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Search name, student number"
              aria-label="Search"
              aria-describedby="basic-addon1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>
        {/* Users Table */}
        <div
          className="custom-scrollbar"
          style={{
            height: "40vh",
            overflowY: "auto",
          }}
        >
          <table className="table rounded">
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#f8f9fa",
                zIndex: 2,
              }}
            >
              <tr>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Student No.</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Name</h5>
                </th>
                <th
                  scope="col"
                  className="text-center align-middle ps-3 ps-lg-5"
                  style={{ minWidth: "clamp(9rem, 50dvw, 15rem)" }}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="form-select border-0 fw-bold text-center"
                      style={{
                        maxWidth: "max-content",
                      }}
                    >
                      <option value="All">Violation(All)</option>
                      {option.map((word, index) => (
                        <option
                          key={index}
                          className="text-break"
                          value={word.reason || word.title}
                        >
                          {word.reason || word.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                {/* <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Count</h5>
                </th> */}
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Status</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Action</h5>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((reportedUser) => (
                  <tr key={reportedUser.userID}>
                    <th scope="row" className="text-center align-middle">
                      <p className="m-0">{reportedUser.studentNumber}</p>
                    </th>
                    <td className="text-center align-middle">
                      <p className="m-0">{`${reportedUser.firstName} ${reportedUser.lastName}`}</p>
                    </td>
                    <td className="text-center align-middle">
                      <p className="m-0">{reportedUser.reason}</p>
                    </td>
                    {/* <td className="text-center align-middle">
                      <p className="m-0">00</p>
                    </td> */}
                    <td className="text-success text-center align-middle">
                      {reportedUser.isAddress === 1 ? (
                        <p className="text-success m-0">Addressed</p>
                      ) : (
                        <p className="text-danger m-0">Pending</p>
                      )}
                    </td>
                    <td className="text-center align-middle">
                      {!reportedUser.isAddress && (
                        <button
                          className="secondaryButton"
                          onClick={() =>
                            handleAddressed(reportedUser.reportedUsersID)
                          }
                        >
                          <p className="m-0">Mark as Reviewed</p>
                        </button>
                      )}
                      <Link to={`/Profile/${reportedUser.reportedUserID}`}>
                        <button className="primaryButton">
                          <p className="m-0">Check</p>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No reported comments available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between">
          {/* Statistics */}
          <div className="row mt-2 w-50">
            <div className="col-lg-2 d-flex flex-column align-items-start">
              <h5 className="m-0">Total: {filteredUsers.length}</h5>
              <p className="m-0 text-secondary">
                Female:{" "}
                {filteredUsers.filter((user) => user.sex === "Female").length}
              </p>
              <p className="m-0 text-secondary">
                Male:{" "}
                {filteredUsers.filter((user) => user.sex === "Male").length}
              </p>
            </div>
          </div>
          {/* Pagination */}
          <Pagination className="d-flex justify-content-center align-items-center mt-4">
            <Pagination.First onClick={() => handlePageChange(1)} />
            <Pagination.Prev
              onClick={handlePrevClick}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => handlePageChange(index + 1)}
              >
                <p className="m-0">{index + 1}</p>
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={handleNextClick}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} />
          </Pagination>
        </div>
      </div>
      {/* Download Button */}
      <div className="row d-flex gap-1 mt-2 px-3">
        <ReportedUsersDownloadButton currentUsers={currentUsers} />
      </div>
    </div>
  );
};

export default ReportedComment;
