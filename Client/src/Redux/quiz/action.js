import * as types from "./types";
import axios from "axios";
import url from "../../BackendURL.js";

//create quiz
export const createQuiz = (data) => async (dispatch) => {
  try {
    dispatch({ type: types.CREATE_QUIZ_REQUEST });
    const token = localStorage.getItem("token");
    console.log("Token before quiz creation:", token);
    console.log("Data before quiz creation:", data);

    const res = await axios.post(`${url}/quiz/create`, { data, token });

    dispatch({
      type: types.CREATE_QUIZ_SUCCESS,
      payload: { quiz: res.data.quiz },
    });

    return res.data; // ✅ SUCCESS RETURN
  } catch (error) {
    console.error("Error creating quiz:", error.response?.data || error);
    dispatch({
      type: types.CREATE_QUIZ_ERROR,
      payload: {
        message: "error",
      },
    });

    return { msg: "Error" }; // ✅ RETURN ERROR ALSO
  }
};


//get all quiz data
export const getQuizData = () => async (dispatch) => {
  try {
    dispatch({ type: types.GET_QUIZ_REQUEST });
    const res = await axios.get(`${url}/quiz/all`);
    dispatch({
      type: types.GET_QUIZ_SUCCESS,
      payload: { quiz: res.data.quizzes },
    });
  } catch (error) {
    dispatch({
      type: types.GET_QUIZ_ERROR,
      payload: {
        message: "error",
      },
    });
  }
};

//delete quiz
export const deleteQuiz = (quizId) => async (dispatch) => {
  try {
    dispatch({ type: types.DELETE_QUIZ_REQUEST });
    const res = await axios.delete(`${url}/quiz/${quizId}`);
    dispatch({
      type: types.DELETE_QUIZ_SUCCESS,
      payload: { quizId },
    });
  } catch (error) {
    dispatch({
      type: types.DELETE_QUIZ_ERROR,
      payload: {
        message: "error",
      },
    });
  }
};
