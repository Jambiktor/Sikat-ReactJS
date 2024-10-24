import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultProfile from "../../../assets/userDefaultProfile.png";
import UserPageMainLayout from "../../Layouts/LayoutUser/UserPageMainLayout";
import OthersJournalEntries from "./UserProfileLayout/OthersJournalEntries";
import OtherProfileDiary from "./UserProfileLayout/OtherProfileDiary";
import ProfileDropdown from "../../Layouts/LayoutUser/ProfileDropdown";
import OthersProfileDropdown from "../../Layouts/LayoutUser/OthersProfileDropdown";

const OtherUserProfile = () => {
  const { userID } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8081/fetchUser/user/${userID}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("User not found");
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userID]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <UserPageMainLayout>
      <div
        className="container d-flex rounded shadow-sm mt-4 py-4 px-4"
        style={{ background: "#ffff" }}
      >
        <div className="w-100 row m-0 py-3">
          <div className="col-lg-4 d-flex justify-content-center align-items-center mb-3 mb-lg-0">
            <div
              style={{
                position: "relative",
                backgroundColor: "#ffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "250px",
                height: "250px",
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
            </div>
          </div>
          <div className="col-md d-flex align-items-end justify-content-between flex-column text-dark text-center text-md-start">
            <div
              className="w-100 position-relative rounded border-bottom p-4"
              style={{ height: "80%" }}
            >
              <h3 className="m-0">
                {user.firstName} {user.lastName} ({user.alias || "No Alias"})
              </h3>
              <p className="m-0 text-secondary">
                {user.followersCount} Followers - {user.followingCount}{" "}
                Following
              </p>
              <p className="mt-3">{user.bio || "No bio available."}</p>
            </div>
            <div>
              <OthersProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-3">
        <div className="row">
          <div className="col-lg-4 mb-2 p-0 px-md-2">
            <div
              className="position-sticky d-flex flex-column gap-2"
              style={{ minHeight: "37vh", top: "70px" }}
            >
              <div>
                <OthersJournalEntries userID={userID} />
              </div>
            </div>
          </div>

          <div className="col p-0 px-md-2">
            <div style={{ minHeight: "60vh" }}>
              <OtherProfileDiary userID={userID} />
            </div>
          </div>
        </div>
      </div>
    </UserPageMainLayout>
  );
};

export default OtherUserProfile;
