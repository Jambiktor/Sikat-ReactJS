import DiaryEntry from "../../../../assets/DiaryEntry.png";
import SampleImage from "../../../../assets/Background.jpg";
import AnonymousIcon from "../../../../assets/Anonymous.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DefaultProfile from "../../../../../src/assets/userDefaultProfile.png";
import HomeDiaryDropdown from "../../../Layouts/LayoutUser/HomeDiaryDropdown";

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

  useEffect(() => {
    console.log("Users:", users);
    console.log("Followed Users:", followedUsers);
  }, [users, followedUsers]);

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

    const isFollowing = followedUsers.includes(followUserId);

    try {
      if (isFollowing) {
        await axios.delete(`http://localhost:8081/unfollow/${followUserId}`, {
          data: { followerId: user.userID },
        });

        setFollowedUsers((prev) => {
          const updatedFollowedUsers = prev.filter((id) => id !== followUserId);
          localStorage.setItem(
            "followedUsers",
            JSON.stringify(updatedFollowedUsers)
          );
          return updatedFollowedUsers;
        });

        alert(`You have unfollowed user ${followUserId}`);
      } else {
        await axios.post(`http://localhost:8081/follow/${followUserId}`, {
          followerId: user.userID,
        });

        setFollowedUsers((prev) => {
          const updatedFollowedUsers = [...prev, followUserId];
          localStorage.setItem(
            "followedUsers",
            JSON.stringify(updatedFollowedUsers)
          );
          return updatedFollowedUsers;
        });

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
          <div>
            <h4 className="text-secondary">Followers</h4>
          </div>
        </div>

        <div
          className="mt-2 pe-1"
          style={{ height: "25vh", overflowY: "scroll" }}
        >
          {followers.map((follower) => (
            <div
              key={follower.userID}
              className="d-flex align-items-center justify-content-between gap-2 border-bottom pb-2 pe-2 mb-2"
            >
              <div className="w-100 d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="profilePicture">
                    <img
                      src={
                        follower.profile_image
                          ? `http://localhost:8081${follower.profile_image}`
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
                  <p className="m-0 ms-2">{follower.username}</p>
                </div>
                <button
                  className="secondaryButton"
                  onClick={() => handleFollowToggle(follower.userID)}
                >
                  {followedUsers.includes(follower.userID)
                    ? "Unfollow"
                    : "Follow"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className=" p-3">
        <div className="d-flex justify-content-between border-bottom">
          <div>
            <h4 className="text-secondary">Following</h4>
          </div>
        </div>
        <div
          className="mt-2 pe-1"
          style={{ height: "40vh", overflowY: "scroll" }}
        >
          {followedUsers.map((followedUser) => (
            <div
              key={followedUser.userID}
              className="d-flex align-items-center justify-content-between gap-2 border-bottom pb-2 pe-2 mb-2"
            >
              <div className="d-flex align-items-center gap-2">
                <div className="profilePicture">
                  <img
                    src={
                      followedUser.profile_image
                        ? `http://localhost:8081${followedUser.profile_image}`
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
                <p className="m-0 ms-2">{followedUser.username}</p>
              </div>
              <div>
                {user.userID !== followedUser.userID && (
                  <button
                    className="secondaryButton"
                    onClick={() => handleFollowToggle(followedUser.userID)}
                  >
                    Unfollow
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Center;
