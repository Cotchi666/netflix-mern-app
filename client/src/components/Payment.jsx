import React from "react";
import RegisterLayout from "./RegisterLayout";
import styles from "../Styles/Register.module.css";
import { v4 as uuidv4 } from "uuid";
import Axios from "axios";
import { login, googleLogin } from "../authContext/apiCalls";
import { useDispatch, useSelector } from "react-redux";
// import { makeRegisterRequest } from '../Redux/Register/action';
import { Redirect, useHistory } from "react-router-dom";
import Loader from "./Loader/Loader";
import { useContext } from "react";
import { AuthContext } from "../authContext/AuthContext";
const Payment = (props) => {
  const { email, password, plan } = props.location.state;
  // const {isAuth} = useSelector(state=>state.login)
  const { dispatch } = useContext(AuthContext);
console.log("plan" , plan)
  const history = useHistory();

  // if(isAuth){
  //   history.push("/profiles")
  // // }
  // const dispatch = useDispatch();
  const handlePayment = async (e) => {
    const API_URL = "http://localhost:8800";
    const response = await Axios.post("http://localhost:8800/payment", {
      amount: plan,
      currency: "INR",
      receipt: uuidv4(),
      payment_capture: 0,
    });
    const { data } = response;
    const options = {
      name: "Netflix RazorPay",
      description: "Integration of Razorpay",
      order_id: data.id,
      handler: async (response) => {
        try {
          const paymentId = response.razorpay_payment_id;
          console.log("payment id", paymentId);
          
          const captureResponse = await Axios.post(`http://localhost:8800/capture/${paymentId}`, {
            amount: plan,
          });
          const successObj = JSON.parse(captureResponse.data);
          const captured = successObj.captured;
          const username = "hello1";
          if (captured) {
            try {
              const data = await Axios.post("http://localhost:8800/api/auth/register", {
                email,
                username,
                password,
              });
            } catch (error) {}
            // history.push("/login");
            //  dispatch(makeRegisterRequest({email,password}))
            // export const makeRegisterRequest = (userDetails) => (dispatch) => {
            //   dispatch(registerRequest());
            //   axios
            //     .post(`${process.env.REACT_APP_BASE_URL}/api/register`, userDetails)
            //     .then((res) => {
            //       dispatch(registerSuccess(res.data.message));
            //       dispatch(makeLoginRequest(userDetails));
            //     })
            //     .catch((err) => {
            //       dispatch(registerFailure(err.response.data.message));
            //     });
            // };
            login({ email, password }, dispatch);
            history.push("/browse");
          }
        } catch (err) {
          console.log(err.message);
        }
      },
      theme: {
        color: "#c6203d",
      },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const token = localStorage.getItem("token");
  return token ? (
    <Redirect to="/profiles" />
  ) : (
    <RegisterLayout>
      <div className={styles.register_payment_container}>
        <img src="/images/lock.png" alt="secure" />
        <p className={styles.register_payment_p}>
          STEP <strong>3</strong> OF <strong>3</strong>
        </p>
        <h3>Set up your payment</h3>
        <p>
          {" "}
          Your membership starts as <br /> soon as you set up payment{" "}
        </p>
        <h4>
          No commitments. <br /> Cancel online anytime.
        </h4>
        <div
          className={styles.register_payment_base}
          onClick={(e) => handlePayment()}
        >
          <p>Credit or Debit Card </p>
          <img src="/images/payment-cards.png" alt="payment" />
        </div>
      </div>
    </RegisterLayout>
  );
};

export default Payment;
