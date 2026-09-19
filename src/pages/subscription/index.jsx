import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import { Check, ShieldCheck, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";

const API = "http://localhost:5001/api";

const plans = [
  {
    name: "Free",
    price: "₹0",
    amount: 0,
    description: "Perfect for getting started",
    applications: "1 application / month",
    applicationLimit: 1,
    features: [
      "1 internship application per month",
      "Access to internship listings",
      "Resume support",
      "Application tracking",
    ],
    button: "Free Plan",
  },
  {
    name: "Bronze",
    price: "₹100",
    amount: 100,
    description: "For students actively applying",
    applications: "3 applications / month",
    applicationLimit: 3,
    features: [
      "3 internship applications per month",
      "Access to internship listings",
      "Resume support",
      "Application tracking",
    ],
    button: "Choose Bronze",
  },
  {
    name: "Silver",
    price: "₹300",
    amount: 300,
    description: "For serious internship seekers",
    applications: "5 applications / month",
    applicationLimit: 5,
    features: [
      "5 internship applications per month",
      "Priority internship access",
      "Resume support",
      "Application tracking",
    ],
    button: "Choose Silver",
    popular: true,
  },
  {
    name: "Gold",
    price: "₹1000",
    amount: 1000,
    description: "For unlimited opportunities",
    applications: "Unlimited applications",
    applicationLimit: -1,
    features: [
      "Unlimited internship applications",
      "Priority internship access",
      "Resume support",
      "Application tracking",
      "Best option for active applicants",
    ],
    button: "Choose Gold",
  },
];

export default function Subscription() {
  const router = useRouter();
  const user = useSelector(selectuser);

  const [currentPlan, setCurrentPlan] = useState("Free");
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // ==========================================
  // LOAD RAZORPAY SCRIPT
  // ==========================================
  useEffect(() => {
    const loadRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        setRazorpayLoaded(true);
      };

      script.onerror = () => {
        setRazorpayLoaded(false);
        toast.error("Unable to load Razorpay. Please refresh the page.");
      };

      document.body.appendChild(script);
    };

    loadRazorpay();
  }, []);

  // ==========================================
  // FETCH CURRENT SUBSCRIPTION
  // ==========================================
  useEffect(() => {
    if (!user?.email) {
      setCurrentPlan("Free");
      setLoadingSubscription(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        setLoadingSubscription(true);

        const response = await axios.get(
          `${API}/subscription/${encodeURIComponent(user.email)}`
        );

        console.log("SUBSCRIPTION RESPONSE:", response.data);

        if (response.data.success && response.data.subscription) {
          const plan = response.data.subscription.plan || "Free";

          console.log("CURRENT PLAN:", plan);

          setCurrentPlan(plan);
        } else {
          setCurrentPlan("Free");
        }
      } catch (error) {
        console.error("SUBSCRIPTION FETCH ERROR:", error);

        setCurrentPlan("Free");
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [user?.email]);

  // ==========================================
  // HANDLE PLAN CLICK
  // ==========================================
  const handlePlanClick = async (plan) => {
    if (!user?.email) {
      toast.error(t("pleaseLoginFirst"));
      return;
    }

    // Free plan cannot be purchased
    if (plan.name === "Free") {
      toast.info("Free plan is your default plan.");
      return;
    }

    // Already subscribed to this plan
    if (plan.name === currentPlan) {
      toast.info(`You are already using the ${plan.name} plan.`);
      return;
    }

    // Prevent multiple clicks
    if (processingPlan) {
      return;
    }

    try {
      setProcessingPlan(plan.name);

      // ==========================================
      // CHECK RAZORPAY
      // ==========================================
      if (!razorpayLoaded || !window.Razorpay) {
        toast.error("Razorpay is still loading. Please try again.");
        setProcessingPlan(null);
        return;
      }

      // ==========================================
      // CREATE PAYMENT ORDER
      // ==========================================
      const response = await axios.post(
        `${API}/subscription/create-order`,
        {
          email: user.email,
          plan: plan.name,
        }
      );

      console.log("CREATE ORDER RESPONSE:", response.data);

      if (!response.data.success) {
        toast.error(
          response.data.message || "Unable to create payment order"
        );

        setProcessingPlan(null);
        return;
      }

      const order = response.data.order;

      // ==========================================
      // RAZORPAY OPTIONS
      // ==========================================
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency,

        name: "Internarea",

        description: `${plan.name} Subscription`,

        order_id: order.id,

        prefill: {
          name: user.name || "",
          email: user.email || "",
        },

        theme: {
          color: "#4f46e5",
        },

        // ==========================================
        // PAYMENT SUCCESS
        // ==========================================
        handler: async function (paymentResponse) {
          try {
            toast.info("Verifying payment...");

            console.log(
              "RAZORPAY PAYMENT RESPONSE:",
              paymentResponse
            );

            // ==========================================
            // VERIFY PAYMENT
            // ==========================================
            const verifyResponse = await axios.post(
              `${API}/subscription/verify-payment`,
              {
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,

                email: user.email,
              }
            );

            console.log(
              "VERIFY PAYMENT RESPONSE:",
              verifyResponse.data
            );

            if (verifyResponse.data.success) {
              // Update current plan immediately
              setCurrentPlan(plan.name);

              toast.success(
                `${plan.name} plan activated successfully!`
              );

              // Redirect to profile
              setTimeout(() => {
                router.push("/profile");
              }, 1200);
            } else {
              toast.error(
                verifyResponse.data.message ||
                  "Payment verification failed"
              );

              setProcessingPlan(null);
            }
          } catch (error) {
            console.error(
              "PAYMENT VERIFICATION ERROR:",
              error
            );

            toast.error(
              error.response?.data?.message ||
                "Payment verification failed"
            );

            setProcessingPlan(null);
          }
        },

        // ==========================================
        // PAYMENT MODAL CLOSED
        // ==========================================
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            setProcessingPlan(null);
          },
        },
      };

      // ==========================================
      // OPEN RAZORPAY
      // ==========================================
      const razorpay = new window.Razorpay(options);

      // ==========================================
      // PAYMENT FAILED
      // ==========================================
      razorpay.on("payment.failed", function (response) {
        console.error(
          "RAZORPAY PAYMENT FAILED:",
          response
        );

        toast.error(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setProcessingPlan(null);
      });

      razorpay.open();
    } catch (error) {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    toast.error(
      error.response?.data?.message ||
        "Payments are allowed only between 10:00 AM and 11:00 AM IST."
    );
    return;
  }

  console.error("CREATE PAYMENT ERROR:", error);
  toast.error(
    error.response?.data?.message ||
      "Unable to create payment order. Please try again."
  );
}
finally {
  setProcessingPlan(false);
}
  };

  // ==========================================
  // BACK TO PROFILE
  // ==========================================
  const handleBackToProfile = () => {
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-slate-200 px-5 py-14 sm:px-8 lg:px-12">

      {/* ==========================================
          BACK TO PROFILE
      ========================================== */}
      <div className="mx-auto mb-6 max-w-6xl">
        <button
          onClick={handleBackToProfile}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>
      </div>

      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="mx-auto mb-14 max-w-3xl text-center">

        <div className="mb-5 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-xs font-bold tracking-widest text-indigo-600">
          INTERNAREA PLANS
        </div>

        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Choose the right plan for your{" "}
          <span className="text-indigo-600">
            internship journey
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
          Apply to more internships and take the next step
          toward your career with a plan that fits your needs.
        </p>

        {/* ==========================================
            CURRENT PLAN
        ========================================== */}
        {!loadingSubscription && (
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">

            <ShieldCheck className="h-4 w-4 text-green-600" />

            Current Plan:

            <span className="text-indigo-600">
              {currentPlan}
            </span>

          </div>
        )}

      </div>

      {/* ==========================================
          PLANS
      ========================================== */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-4 xl:grid-cols-4">

        {plans.map((plan) => {

          const isCurrent = plan.name === currentPlan;

          const isLoading = processingPlan === plan.name;

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.popular
                  ? "border-2 border-indigo-600 shadow-lg shadow-indigo-100"
                  : "border border-slate-200"
              }`}
            >

              {/* ==========================================
                  POPULAR
              ========================================== */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1.5 text-[10px] font-bold tracking-wider text-white">
                  MOST POPULAR
                </div>
              )}

              {/* ==========================================
                  PLAN NAME
              ========================================== */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {plan.name}
                </h2>

                <p className="mt-2 min-h-[40px] text-sm leading-5 text-slate-500">
                  {plan.description}
                </p>
              </div>

              {/* ==========================================
                  PRICE
              ========================================== */}
              <div className="mt-7 flex items-baseline gap-1">

                <span className="text-4xl font-bold text-slate-900">
                  {plan.price}
                </span>

                <span className="text-sm text-slate-500">
                  /month
                </span>

              </div>

              {/* ==========================================
                  APPLICATION LIMIT
              ========================================== */}
              <div className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-center text-sm font-semibold text-indigo-600">
                {plan.applications}
              </div>

              <div className="my-6 h-px bg-slate-100" />

              {/* ==========================================
                  FEATURES
              ========================================== */}
              <ul className="flex-1 space-y-4">

                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm leading-5 text-slate-600"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <Check className="h-3 w-3" />
                    </span>

                    <span>{feature}</span>
                  </li>
                ))}

              </ul>

              {/* ==========================================
                  BUTTON
              ========================================== */}
              <button
                onClick={() => handlePlanClick(plan)}
                disabled={
                  isCurrent ||
                  processingPlan !== null
                }
                className={`mt-8 w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                  isCurrent
                    ? "cursor-not-allowed bg-green-100 text-green-700"
                    : processingPlan !== null
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : plan.popular
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700"
                    : "border border-slate-300 bg-white text-slate-800 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {isLoading
                  ? "Processing..."
                  : isCurrent
                  ? "✓ Current Plan"
                  : plan.button}
              </button>

            </div>
          );
        })}

      </div>

      {/* ==========================================
          SECURITY
      ========================================== */}
      <div className="mt-10 text-center">

        <p className="text-sm text-slate-500">
          🔒 Secure payments powered by Razorpay
        </p>

        <p className="mt-2 text-xs text-slate-400">
          Payments are available only during the
          configured payment window.
        </p>

      </div>

    </div>
  );
}