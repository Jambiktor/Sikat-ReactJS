import React, { useState, useRef } from "react";
import AnonymousIcon from "../../../assets/Anonymous.png";
import sampleBackground from "../../../assets/Background.jpg";
import AdminPageMainLayout from "../../Layouts/LayoutAdmin/AdminPageMainLayout";
import CommentDropdown from "../../Layouts/LayoutUser/CommentDropdown";

const DiaryEntry = () => {
  const [activeButton, setActiveButton] = useState(false);
  const [expandButton, setExpandButton] = useState(false);
  const [gadifyCount, setGadifyCount] = useState(0);

  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const fetchUser = JSON.parse(userData);

      fetch(`http://localhost:8081/fetchUser/user/${fetchUser.userID}`)
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
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
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
        console.error("Response data is not an array", response.data);
        setEntries([]);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError("No entry.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a ref for the comment section
  const commentSectionRef = useRef(null);

  const handleClick = () => {
    const newActiveState = !activeButton;
    setActiveButton(newActiveState);

    // Toggle the Gadify count
    if (newActiveState) {
      setGadifyCount(gadifyCount + 1);
    } else {
      setGadifyCount(gadifyCount - 1);
    }

    // Expand button animation logic
    setExpandButton(true);
    setTimeout(() => {
      setExpandButton(false);
    }, 300);
  };

  // Function to scroll to the comment section
  const scrollToComments = () => {
    commentSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AdminPageMainLayout>
      <div className="d-flex align-items-center flex-column">
        <div
          className="bg-light rounded shadow-sm mt-5 p-0 text-start"
          style={{ width: "800px" }}
        >
          <div className="text-center border-bottom border-2 py-2">
            <h3 className="m-0">Journal Title</h3>
          </div>
          <div className="px-4 py-3">
            <div className="w-100 d-flex align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center">
                <div className="profilePicture d-flex align-items-center justify-content-center pt-1">
                  <img src={AnonymousIcon} alt="" style={{ width: "80%" }} />
                </div>
                <h6 className="m-0 ms-2">UserName</h6>
              </div>
            </div>
            <div className="border-top border-bottom my-2 p-2">
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum
                quaerat, excepturi, voluptate et pariatur at nam temporibus
                magni cupiditate eos impedit voluptates, tenetur nihil repellat!
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni
                repudiandae autem neque! Assumenda, ipsam molestiae.
              </p>
              <img
                className="rounded"
                src={sampleBackground}
                alt=""
                style={{ width: "100%" }}
              />
            </div>

            {/* Display when the diary is public */}
            <div className="row">
              <div className="col">
                <button
                  className={`InteractButton ${activeButton ? "active" : ""} ${
                    expandButton ? "expand" : ""
                  }`}
                  onClick={handleClick}
                >
                  <span>({gadifyCount}) </span>Gadify
                </button>
              </div>
              <div className="col">
                {/* Scroll to the comment section when this button is clicked */}
                <button className="InteractButton" onClick={scrollToComments}>
                  Comment
                </button>
              </div>
              <div className="col">
                <button className="InteractButton">Flag</button>
              </div>
            </div>
          </div>
        </div>

        {/* COMMENT SECTION */}
        <div
          ref={commentSectionRef} // Attach ref to the comment section
          className="bg-light rounded shadow-sm mt-2 mb-3 px-3 pt-2 text-start"
          style={{ width: "800px" }}
        >
          <div className="border-bottom py-1 mb-2 text-secondary">
            <p className="m-0">Comments</p>
          </div>
          <div
            className="d-flex flex-column gap-2 mb-3"
            style={{ height: "", overflowY: "scroll" }}
          >
            <div>
              <div className="d-flex align-items-start flex-column gap-2 pb-2">
                <div className="w-100 d-flex align-items-center justify-content-between pe-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="profilePicture d-flex align-items-center justify-content-center pt-1">
                      <img
                        src={AnonymousIcon}
                        alt=""
                        style={{ width: "80%" }}
                      />
                    </div>
                    <div className="d-flex justify-content-start flex-column">
                      <h6 className="m-0 text-start">UserName</h6>
                    </div>
                  </div>
                  <div>
                    <CommentDropdown></CommentDropdown>
                  </div>
                </div>
              </div>

              {/* Replies */}
              <div className="ms-4 ps-2 border-start border-2 rounded-bottom-5">
                <p className="m-0 text-secondary">
                  Sample Comment Lorem ipsum, dolor sit amet consectetur
                  adipisicing elit. Quisquam explicabo accusamus nobis rem ipsa
                  illo?
                </p>
                <div className="">
                  <button className="btn btn-light btn-sm">Gadify</button>
                  <button className="btn btn-light btn-sm">Reply</button>
                </div>
                <div className="d-flex align-items-start flex-column gap-2 ps-1 pb-2 mt-2">
                  <div className="w-100 d-flex align-items-center justify-content-between pe-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="profilePicture d-flex align-items-center justify-content-center pt-1">
                        <img
                          src={AnonymousIcon}
                          alt=""
                          style={{ width: "80%" }}
                        />
                      </div>
                      <div className="d-flex justify-content-start flex-column">
                        <h6 className="m-0 text-start">UserName</h6>
                      </div>
                    </div>
                    <div>
                      <CommentDropdown></CommentDropdown>
                    </div>
                  </div>
                  <p className="ps-5 m-0 text-secondary">
                    Sample Comment Lorem ipsum, dolor sit amet consectetur
                    adipisicing elit. Quisquam explicabo accusamus nobis rem
                    ipsa illo?
                  </p>
                  <div className="ps-5">
                    <button className="btn btn-light btn-sm">Gadify</button>
                    <button className="btn btn-light btn-sm">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPageMainLayout>
  );
};

export default DiaryEntry;
