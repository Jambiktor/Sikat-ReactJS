import DiaryEntry from "../../../../assets/DiaryEntry.png";
import SampleImage from "../../../../assets/Background.jpg";
import AnonymousIcon from "../../../../assets/Anonymous.png";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DefaultProfile from "../../../../../src/assets/anonymous.png";
import HomeDiaryDropdown from "../../../Layouts/LayoutUser/HomeDiaryDropdown";

const UserList = ({ users, handleFollowToggle, isFollowing }) => (
  <div
    className="custom-scrollbar mt-2 pe-1"
    style={{ height: "25vh", overflowY: "scroll" }}
  >
    {users.map((user) => (
      <div
        key={user.userID}
        className="d-flex align-items-center justify-content-between gap-2 border-bottom pb-2 pe-2 mb-2"
      >
        <div className="d-flex align-items-center gap-2">
          <div className="profilePicture">
            <img
              src={
                user.profile_image
                  ? `http://localhost:8081${user.profile_image}`
                  : DefaultProfile
              }
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <p className="m-0 ms-2">{user.username}</p>
          <button
            className="secondaryButton"
            onClick={() => handleFollowToggle(user.userID)}
          >
            {isFollowing(user.userID) ? "Unfollow" : "Follow"}
          </button>
        </div>
      </div>
    ))}
  </div>
);

const Center = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchFollowers(parsedUser.userID);
      fetchUsers();
      fetchFollowedUsers(parsedUser.userID);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8081/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const fetchFollowedUsers = async (userID) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/followedUsers/${userID}`
      );
      const followedUsersData = response.data; // Store full user data
      setFollowedUsers(followedUsersData); // Set the full data to state
      console.log("Fetched followed users:", followedUsersData);
      localStorage.setItem("followedUsers", JSON.stringify(followedUsersData));
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const handleFollowToggle = async (followUserId) => {
    if (!followUserId) {
      console.error("User ID to follow/unfollow is undefined");
      return;
    }

    if (user.userID === followUserId) {
      alert("You cannot follow yourself.");
      return;
    }

    const isFollowing = followedUsers.some((f) => f.userID === followUserId);

    try {
      if (isFollowing) {
        await axios.delete(`http://localhost:8081/unfollow/${followUserId}`, {
          data: { followerId: user.userID },
        });

        setFollowedUsers((prev) =>
          prev.filter((u) => u.userID !== followUserId)
        );
        alert(`You have unfollowed user ${followUserId}`);
      } else {
        const response = await axios.post(
          `http://localhost:8081/follow/${followUserId}`,
          {
            followerId: user.userID,
          }
        );
        const followedUserData = response.data; // Expect the user data in the response

        setFollowedUsers((prev) => [...prev, followedUserData]);
        alert(`You are now following user ${followUserId}`);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      alert("There was an error processing your request.");
    }
  };

  if (!user) return null;

  return (
    <div className="p-2">
      <div className="rounded p-3 mb-2">
        <div className="d-flex justify-content-between border-bottom">
          <h4 className="text-secondary">Reported User/s</h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div
            className="w-100 custom-scrollbar mt-2 pe-1"
            style={{ height: "25vh", overflowY: "scroll" }}
          >
            {/* WHEN CLICKED IT SHOULD DISPLAY THE COMMENT OF THE REPORTED USER */}
            <Link
              to="/Admin/DiaryEntry"
              className="text-decoration-none"
              style={{ cursor: "pointer" }}
            >
              <div className="linkText d-flex align-items-center gap-2 rounded">
                <div className="profilePicture">
                  <img
                    src={DefaultProfile}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <p className="text-secondary m-0">FullName</p>
                  <p className="text-danger m-0">Violation,Violation</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="d-flex justify-content-between border-bottom">
          <h4 className="text-secondary">Flagged Diaries</h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div
            className="w-100 custom-scrollbar mt-2 pe-1"
            style={{ height: "40vh", overflowY: "scroll" }}
          >
            <Link
              to="/Admin/DiaryEntry"
              className="text-decoration-none"
              style={{ cursor: "pointer" }}
            >
              <div className="linkText d-flex align-items-center gap-2 rounded">
                <div className="profilePicture">
                  <img
                    src={DefaultProfile}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <p className="text-secondary m-0">FullName</p>
                  <h5 className="text-secondary m-0">Journal Title</h5>
                </div>
              </div>
            </Link>
            <Link
              to="/Admin/DiaryEntry"
              className="text-decoration-none"
              style={{ cursor: "pointer" }}
            >
              <div className="linkText d-flex align-items-center gap-2 rounded">
                <div className="profilePicture">
                  <img
                    src={DefaultProfile}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <p className="text-secondary m-0">FullName</p>
                  <h5 className="text-secondary m-0">Journal Title</h5>
                </div>
              </div>
            </Link>
            <Link
              to="/Admin/DiaryEntry"
              className="text-decoration-none"
              style={{ cursor: "pointer" }}
            >
              <div className="linkText d-flex align-items-center gap-2 rounded">
                <div className="profilePicture">
                  <img
                    src={DefaultProfile}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <p className="text-secondary m-0">FullName</p>
                  <h5 className="text-secondary m-0">Journal Title</h5>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Center;
