"use client";

import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      if (!session_id) return;
      try {
        const res = await fetch(`/api/checkout_sessions?session_id=${session_id}`);
        const sessionData = await res.json();
        console.log("Fetched session data:", sessionData);
        if (res.ok) {
          setSession(sessionData);
        } else {
          console.error("Error in API response:", sessionData.error);
          setError(sessionData.error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("An error occurred while retrieving the session.");
      } finally {
        setLoading(false);
      }
    };
    fetchCheckoutSession();
  }, [session_id]);

  useEffect(() => {
    if (session && session.payment_status === "paid") {
      const timer = setTimeout(() => {
        router.push("/generate");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [session, router]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
      <Card>
        <CardContent>
          {session.payment_status === "paid" ? (
            <>
              <Typography variant="h4">Thank you for your purchase!</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Session ID: {session_id}</Typography>
                <Typography variant="body1">
                  We have received your payment. You will receive an email with the order details shortly.
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  You now have {session.amount_total / 100 === 10 ? 30 : 10} generations available.
                </Typography>
                <Typography variant="body2" sx={{ mt: 4 }}>
                  Redirecting to the generate page in 5 seconds...
                </Typography>
                <CircularProgress sx={{ mt: 2 }} />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push("/generate")}
                  sx={{ mt: 2 }}
                >
                  Go to Generate Page Now
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h4">Payment failed</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  Your payment was not successful. Please try again.
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Page;