import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleContentData } from "../../Redux/content/action";

//component imports
import Navbar from "../../Components/Sidebar/Navbar";
import Header from "../../Components/Header/Header";

//css imports
import "./SingleContent.css";

const SingleContent = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  //redux states
  const {
    data: { isAuthenticated },
  } = useSelector((store) => store.auth);
  const { singleContent } = useSelector((store) => store.content);

  // disabling right click
  useEffect(() => {
    const handleContextmenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextmenu);
    return function cleanup() {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  useEffect(() => {
    dispatch(getSingleContentData(params.id));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return navigate("/");
    }
  }, []);

  const renderMedia = () => {
    if (!singleContent) return null;
    const type = singleContent.fileType?.toLowerCase() || "";
    const url = singleContent.fileUrl;

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(type)) {
      return <img src={url} alt="Content" style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />;
    } else if (["mp4", "webm", "ogg", "mov"].includes(type)) {
      return (
        <video allow="fullscreen" frameBorder="0" width="100%" controls controlsList="nodownload">
          <source src={url} />
        </video>
      );
    } else if (type === "pdf") {
      return <iframe src={url} width="100%" height="600px" title="PDF Document" frameBorder="0"></iframe>;
    } else {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      return (
        <div style={{ textAlign: "center" }}>
          <iframe src={viewerUrl} width="100%" height="600px" title="Document Viewer" frameBorder="0"></iframe>
          <p style={{ marginTop: "10px" }}>
            If the document doesn't load, <a href={url} target="_blank" rel="noopener noreferrer">click here to download / view</a>.
          </p>
        </div>
      );
    }
  };

  return (
    <Navbar>
      <div className="singleContent">
        <Header Title={"Content"} Address={"Contents"} />

        {/* media component  */}
        <div className="singleContentData">
          <div className="fileContainer">
            {renderMedia()}
          </div>
        </div>

        <div className="singleContentDetails">
          <p>Topic : {singleContent?.title}</p>
          <p>Class : {singleContent?.class}</p>
          <p>Subject : {singleContent?.subject}</p>
          <p>Content Type : {singleContent?.type}</p>
          <p>Tutor : {singleContent?.creator}</p>
        </div>
      </div>
    </Navbar>
  );
};

export default SingleContent;
