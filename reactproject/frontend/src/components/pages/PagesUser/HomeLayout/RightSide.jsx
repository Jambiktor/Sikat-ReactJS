import DiaryEntry from "../../../../assets/DiaryEntry.png";
import SampleImage from "../../../../assets/Background.jpg";
import AnonymousIcon from "../../../../assets/Anonymous.png";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DefaultProfile from "../../../../../src/assets/userDefaultProfile.png";
import HomeDiaryDropdown from "../../../Layouts/LayoutUser/HomeDiaryDropdown";

const UserList = ({ users, handleFollowToggle, isFollowing }) => (
  <div
    className="custom-scrollbar mt-2 pe-1"
    style={{ height: "65vh", overflowY: "scroll" }}
  >
    {users.map((user) => (
      <div key={user.userID} className="pb-2 pe-2 mb-2">
        <div className="w-100 d-flex align-items-center justify-content-between gap-2">
          <Link
            to={`/OtherProfile/${user.userID}`}
            className="linkText position-relative rounded d-flex justify-content-between w-100 p-2"
          >
            <div className="d-flex align-items-center">
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
            </div>
          </Link>
          <button
            className="secondaryButton position-absolute"
            onClick={() => handleFollowToggle(user.userID)}
            style={{ right: "55px" }}
          >
            {isFollowing(user.userID) ? "Unfollow" : "Follow"}
          </button>
        </div>
      </div>
    ))}
  </div>
);

const RightSide = () => {
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
        const confirmed = window.confirm(
          `Are you sure you want to unfollow this ${followUserId}?`
        );

        if (!confirmed) {
          return;
        }
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
    <div className="p-2 " style={{ height: "87vh" }}>
      <div className="text-end" style={{ fontSize: "15px", color: "gray" }}>
        <p className="m-0 mb-1">
          Are you or someone you know experiencing gender-based violence?
        </p>
        <Link to={"/GetHelp/"}>
          <button className="secondaryButton text-decoration-underline">
            Get Support Now
          </button>
        </Link>
      </div>

      <div className="rounded mb-2 mt-3" style={{}}>
        <div className="d-flex align-items-center justify-content-start gap-1 border-top border-secondary-subtle text-secondary pt-2">
          <i class="bx bx-group bx-sm"></i>
          <h4 className="m-0">Followers</h4>
        </div>

        <UserList
          users={followers}
          handleFollowToggle={handleFollowToggle}
          isFollowing={(id) => followedUsers.some((f) => f.userID === id)}
        />
      </div>

      {/* <div className="p-3">
        <div className="d-flex justify-content-between border-bottom">
          <h4 className="text-secondary">Following</h4>
        </div>
        <UserList
          users={followedUsers}
          handleFollowToggle={handleFollowToggle}
          isFollowing={() => true}
        />
      </div> */}
    </div>
  );
};

export default RightSide;
