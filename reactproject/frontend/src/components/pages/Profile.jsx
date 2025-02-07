import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DefaultProfile from "../../assets/userDefaultProfile.png";
import MainLayout from "../Layouts/MainLayout";
import JournalEntries from "../Layouts/Profile/JournalEntries";
import DiaryEntryLayout from "../Layouts/Profile/DiaryEntryLayout";
import ProfileDropdown from "../Layouts/Profile/ProfileDropdown";
import OthersProfileDropdown from "../Layouts/Profile/OthersProfileDropdown";
import axios from "axios";
// import { Accordion } from "react-bootstrap";
import FlaggedDiaries from "../Layouts/Profile/FlaggedDiaries";
import ReportedComments from "../Layouts/Profile/ReportedComments";
import Followers from "../Layouts/Profile/Followers";
import { SuspensionModal } from "../Layouts/Profile/SuspensionModal";
import MessageModal from "../Layouts/DiaryEntry/messageModal";
import MessageAlert from "../Layouts/DiaryEntry/messageAlert";
import BackButton from "../Layouts/Home/BackButton";
// import Suspended from "../../components/pages/PagesUser/Suspended";

const Profile = () => {
  const { userID } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [entries, setEntries] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [expandButtons, setExpandButtons] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  let currentUser = null;

  const [modal, setModal] = useState({
    show: false,
    message: "",
  });
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

  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch (err) {
    console.error("Error parsing current user:", err);
  }

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/fetchUser/user/${userID}`
        );
        if (!response.ok) throw new Error("User not found");
        const data = await response.json();

        console.log("User data:", data);
        // if (data.isSuspended === 1) {
        //   navigate("/suspended");
        //   return;
        // }
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userID, navigate]);

  useEffect(() => {
    if (user) {
      fetchFollowedUsers(user.userID);
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/fetchUserEntry/user/${user.userID}`
      );

      if (response.data.entries && Array.isArray(response.data.entries)) {
        setEntries(response.data.entries);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError("No entries available.");
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes

    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        setModal({
          show: true,
          message: `File size exceeds the 2MB limit. Please select a smaller file.`,
        });
        setFile(null);
      } else {
        setFile(selectedFile);

        uploadProfile(selectedFile);
      }
    }
  };

  const uploadProfile = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userID", user.userID);

    setConfirmModal({
      show: true,
      message: `Are you sure you want to change your profile?`,
      onConfirm: async () => {
        axios
          .post("http://localhost:8081/uploadProfile", formData)
          .then((res) => {
            console.log("Profile uploaded successfully", res.data);
            setConfirmModal({ show: false, message: "" });
            setModal({
              show: true,
              message: `Profile uploaded successfully.`,
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          })
          .catch((error) => {
            console.error("Error uploading profile:", error);
          });
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
  };

  const fetchFollowedUsers = async () => {
    try {
      if (!currentUser || !currentUser.userID) {
        console.error("Current user or userID is not available");
        return;
      }
      const response = await axios.get(
        `http://localhost:8081/followedUsers/${currentUser.userID}`
      );
      const followedUsersData = response.data.map((user) => user.userID);
      setFollowedUsers(followedUsersData);
      console.log("Followed Users:", followedUsersData);
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const fetchFollowers = async (userID) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/followers/${userID}`
      );
      setFollowers(response.data);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const handleFollowToggle = async (followUserId) => {
    if (!followUserId) {
      console.error("User ID to follow/unfollow is undefined");
      return;
    }

    if (currentUser.userID === followUserId) {
      setModal({
        show: true,
        message: `You cannot follow yourself.`,
      });
      return;
    }

    const isFollowing = followedUsers.includes(followUserId);

    try {
      if (isFollowing) {
        setConfirmModal({
          show: true,
          message: `Are you sure you want to unfollow ${user.firstName}?`,
          onConfirm: async () => {
            try {
              await axios.delete(
                `http://localhost:8081/unfollow/${followUserId}`,
                {
                  data: { followerId: currentUser.userID },
                }
              );

              // Update followed users list after unfollowing
              setFollowedUsers((prev) =>
                prev.filter((id) => id !== followUserId)
              );

              // Close confirmation modal and show success modal
              setConfirmModal({ show: false, message: "" });
              setModal({
                show: true,
                message: `You have unfollowed ${user.firstName}.`,
              });

              // Refresh the followed users list from the backend
              await fetchFollowedUsers(user.userID);
            } catch (error) {
              console.error("Error unfollowing user:", error);
              setModal({
                show: true,
                message: `There was an error unfollowing ${targetUsername}.`,
              });
            }
          },
          onCancel: () => setConfirmModal({ show: false, message: "" }),
        });
      } else {
        const response = await axios.post(
          `http://localhost:8081/follow/${followUserId}`,
          {
            followerId: currentUser.userID,
          }
        );

        if (response.data.message === "Already following this user") {
          setModal({
            show: true,
            message: `You are already following this user.`,
          });
          return;
        }

        setFollowedUsers((prev) => [...prev, followUserId]);
        setModal({
          show: true,
          message: `You are now following ${user.username}.`,
        });

        await axios.post(
          `http://localhost:8081/notifications/${followUserId}`,
          {
            userID: followUserId,
            actorID: currentUser.userID,
            entryID: null,
            profile_image: user.profile_image,
            type: "follow",
            message: `${currentUser.firstName} ${currentUser.lastName} has followed you.`,
          }
        );
      }

      await fetchFollowedUsers(currentUser.userID);
    } catch (error) {
      console.error("Error toggling follow status:", error);
      setModal({
        show: true,
        message: `There was an error processing your request.`,
      });
    }
  };

  const handleGadify = (entryID) => {
    if (!user) return;

    const entry = entries.find((entry) => entry.entryID === entryID);
    if (!entry) return;

    axios
      .post(`http://localhost:8081/entry/${entryID}/gadify`, {
        userID: currentUser.userID,
      })
      .then((res) => {
        const isGadified =
          res.data.message === "Gadify action recorded successfully";

        setEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.entryID === entryID
              ? {
                  ...entry,
                  gadifyCount: isGadified
                    ? entry.gadifyCount + 1
                    : entry.gadifyCount - 1,
                  isGadified: !entry.isGadified, // Toggle gadify status
                }
              : entry
          )
        );
        if (isGadified && currentUser.userID !== entry.userID) {
          axios
            .post(`http://localhost:8081/notifications/${entry.userID}`, {
              actorID: currentUser.userID,
              entryID: entryID,
              profile_image: currentUser.profile_image,
              type: "gadify",
              message: `${currentUser.firstName} ${currentUser.lastName} gadified your diary entry.`,
            })
            .then((res) => {
              console.log("Notification response:", res.data);
            })
            .catch((err) => {
              console.error("Error sending gadify notification:", err);
            });
        }
      })
      .catch((err) => console.error("Error updating gadify count:", err));
  };

  const handleClick = (entryID) => {
    const updatedExpandButtons = { ...expandButtons, [entryID]: true };
    setExpandButtons(updatedExpandButtons);

    setTimeout(() => {
      updatedExpandButtons[entryID] = false;
      setExpandButtons({ ...updatedExpandButtons });
    }, 300);

    handleGadify(entryID);
  };

  const formatDate = (dateString) => {
    const entryDate = new Date(dateString);
    const now = new Date();
    const timeDiff = now - entryDate;

    if (timeDiff < 24 * 60 * 60 * 1000) {
      return entryDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return entryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const suspensionTime = (suspendUntil) => {
    const now = new Date();
    const suspendDate = new Date(suspendUntil);

    const diff = suspendDate - now;

    if (diff <= 0) {
      return ``;
    }

    const year = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const month = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
    );
    const day = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
    );
    const hour = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minute = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `Y:${year} M:${month} D:${day} H:${hour} M:${minute}`;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const ownProfile = currentUser.userID == userID;

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <MainLayout>
      <div
        className="container d-flex rounded shadow-sm mt-4 p-2 pt-3 pt-md-2"
        style={{ background: "#ffff" }}
      >
        <BackButton></BackButton>
        <MessageAlert
          showModal={modal}
          closeModal={closeModal}
          title={"Notice"}
          message={modal.message}
        ></MessageAlert>
        <MessageModal
          showModal={confirmModal}
          closeModal={closeConfirmModal}
          title={"Notice"}
          message={confirmModal.message}
          confirm={confirmModal.onConfirm}
          needConfirm={1}
        ></MessageModal>

        {user.isSuspended ? (
          <SuspensionModal
            name={user.firstName}
            isAdmin={currentUser.isAdmin}
            show={true}
          ></SuspensionModal>
        ) : (
          ""
        )}
        <div className="w-100 row m-0">
          <div className="col-lg-4 d-flex justify-content-center align-items-center mb-3 mb-lg-0 p-1 p-md-3">
            <div
              style={{
                position: "relative",
                backgroundColor: "#ffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "clamp(10rem, 17dvw, 20rem)",
                height: "clamp(10rem, 17dvw, 20rem)",
                borderRadius: "50%",
              }}
            >
              <img
                src={
                  user && user.profile_image
                    ? `http://localhost:8081${user.profile_image}`
                    : DefaultProfile
                }
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              {ownProfile && (
                <label
                  htmlFor="uploadProfile"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className="grayHover d-flex align-items-center justify-content-center"
                    style={{
                      position: "absolute",
                      borderRadius: "50%",
                      width: "clamp(2.3rem, 3dvw, 3rem)",
                      height: "clamp(2.3rem, 3dvw, 3rem)",
                      border: "3px solid #ffff",
                      right: ".2rem",
                      bottom: "15px",
                    }}
                  >
                    <i
                      className={isHovered ? "bx bxs-camera" : "bx bx-camera"}
                      style={{
                        color: "var(--primary)",
                        fontSize: "clamp(1.5rem, 5dvw, 1.8rem)",
                      }}
                    ></i>
                    <input
                      type="file"
                      id="uploadProfile"
                      hidden
                      onChange={handleFileChange}
                    />
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="col-md d-flex align-items-end justify-content-between flex-column text-dark text-center text-lg-start">
            <div
              className="w-100 position-relative rounded border-bottom pt-2 pt-lg-5"
              style={{ height: "80%" }}
            >
              <div>
                <h4 className="m-0">
                  {user.firstName} {user.lastName}
                  {ownProfile ? <> ({user.alias || "No Alias"})</> : null}
                </h4>
                {currentUser.isAdmin ? (
                  <>
                    <p className="m-0 text-secondary">
                      {user.cvsuEmail} - {user.studentNumber}
                    </p>
                    <p className="m-0 mb-1 text-secondary">{user.course}</p>
                  </>
                ) : (
                  ""
                )}
                {currentUser.isAdmin ? (
                  <h5 className="text-danger">
                    {user.isSuspended ? "Suspended " : ""}
                    {suspensionTime(user.suspendUntil)}
                  </h5>
                ) : (
                  ""
                )}
              </div>

              {user.isAdmin ? (
                ""
              ) : (
                <Followers
                  ownProfile={ownProfile}
                  user={user}
                  currentUser={currentUser}
                  followersCount={user.followersCount}
                  followingCount={user.followingCount}
                ></Followers>
              )}
              <p className="mt-3 text-secondary">
                {user.bio || "No bio available."}
              </p>
            </div>
            <div
              className="w-100 d-flex justify-content-center  justify-content-lg-between algn-items-center pt-1"
              style={{ height: "4rem" }}
            >
              {ownProfile ? (
                <div>
                  {/* <button className="primaryButton py-2 px-5">
                    <h5 className="m-0">Follow</h5>
                  </button> */}
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  {currentUser.isAdmin ? (
                    <div className="d-flex gap-1">
                      <FlaggedDiaries userID={user.userID}></FlaggedDiaries>
                      <ReportedComments userID={user.userID}></ReportedComments>
                    </div>
                  ) : (
                    <>
                      {user.isAdmin ? (
                        <>
                          {/* <button
                            className="primaryButtonDisabled py-2 px-5"
                            disabled={user.isAdmin}
                          >
                            <h5 className="m-0">Follow</h5>
                          </button> */}
                        </>
                      ) : (
                        <>
                          <button
                            className="primaryButton py-2 px-5"
                            onClick={() => handleFollowToggle(user.userID)} // Use the user's ID directly
                            disabled={user.isAdmin}
                          >
                            <h5 className="m-0">
                              {" "}
                              {followedUsers.includes(user.userID)
                                ? "Unfollow"
                                : "Follow"}
                            </h5>
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* {currentUser && currentUser.isAdmin ? "Im Admin" : " Im Not"} */}
              {ownProfile ? (
                <ProfileDropdown
                  userID={user.userID}
                  isAdmin={currentUser.isAdmin}
                />
              ) : (
                <>
                  {user.isAdmin ? (
                    ""
                  ) : (
                    <OthersProfileDropdown
                      isAdmin={currentUser.isAdmin}
                      user={user}
                      entry={entries}
                      ownerAdmin={user.isAdmin}
                      userID={user.userID}
                      firstName={user.firstName}
                      reportedUserID={user.userID}
                      toBeReported={user.username}
                      suspended={user.isSuspended}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-2">
        <div className="row">
          <div className="col-lg-4 mb-2 p-0 px-md-1">
            {/* {currentUser && currentUser.isAdmin ? "Im Admin" : " Im Not"} */}
            <JournalEntries
              user={user}
              isAdmin={currentUser.isAdmin}
              userID={userID}
              ownProfile={ownProfile}
            />
            {/* {user.isSuspended} */}
          </div>

          <div className="col-md mb-2 p-0 px-md-1">
            {entries.length > 0 ? (
              entries
                .filter(
                  (entry) =>
                    currentUser.isAdmin ||
                    ownProfile ||
                    (entry.visibility !== "private" &&
                      entry.anonimity !== "private")
                )
                .map((entry) => (
                  <>
                    {!ownProfile && entry.visibility === "private" ? null : (
                      <div className="w-100 ">
                        <DiaryEntryLayout
                          key={entry.entryID}
                          entry={entry}
                          user={user}
                          isGadified={entry.isGadified}
                          currentUser={currentUser}
                          suspended={user.isSuspended}
                          followedUsers={followedUsers}
                          handleFollowToggle={handleFollowToggle}
                          handleClick={handleClick}
                          expandButtons={expandButtons}
                          formatDate={formatDate}
                        />
                      </div>
                    )}
                  </>
                ))
            ) : (
              <p className="m-0 text-secondary mt-1 mt-xl-3">
                No diary entries.
                {/* , Post{" "}
                <Link
                  className="text-decoration-none"
                  to={user && user.isAdmin ? "/Admin/Home" : "/Home"}
                >
                  here
                </Link>
                . */}
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
