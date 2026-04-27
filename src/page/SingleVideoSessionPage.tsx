import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { usePageTitle } from "@/store/pageTitleStore";
import type {
  ProviderSessionConnection,
  StartedProviderSession,
} from "@/api/sessions";
import {
  Camera,
  Clock3,
  FilePlus2,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

interface LiveSessionLocationState {
  session?: StartedProviderSession;
  connection?: ProviderSessionConnection;
}

const buildInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function SingleVideoSessionPage() {
  usePageTitle("Video Sessions");

  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LiveSessionLocationState | undefined) ?? {};
  const liveSession = state.session;
  const connection = state.connection;

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localVideoContainerRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedRef = useRef(false);

  const [isJoined, setIsJoined] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [rtcError, setRtcError] = useState<string | null>(null);

  const patient = liveSession?.appointmentId?.patientId;
  const patientName =
    `${patient?.firstName ?? "Unknown"} ${patient?.lastName ?? ""}`.trim();
  const patientInitials = buildInitials(patient?.firstName, patient?.lastName);

  const primaryRemoteUser = useMemo(
    () =>
      remoteUsers.find((user) => Boolean(user.videoTrack)) ?? remoteUsers[0],
    [remoteUsers],
  );

  const cleanupAgora = useCallback(async () => {
    const client = clientRef.current;

    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }

      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }

      if (client) {
        client.removeAllListeners();
        await client.leave();
      }
    } catch {
      // no-op: leaving should not block UI cleanup
    }

    clientRef.current = null;
    setRemoteUsers([]);
    setIsJoined(false);
    setIsMicOn(true);
    setIsCameraOn(true);
  }, []);

  useEffect(() => {
    if (!liveSession || !connection) {
      return;
    }

    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;
    let isCancelled = false;

    const initializeAgora = async () => {
      try {
        setRtcError(null);
        setConnectionStatus("Connecting...");

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("connection-state-change", (currentState) => {
          if (!isCancelled) {
            setConnectionStatus(currentState);
          }
        });

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (mediaType === "audio") {
            user.audioTrack?.play();
          }

          if (!isCancelled) {
            setRemoteUsers([...client.remoteUsers]);
          }
        });

        client.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "video") {
            user.videoTrack?.stop();
          }

          if (!isCancelled) {
            setRemoteUsers([...client.remoteUsers]);
          }
        });

        client.on("user-left", () => {
          if (!isCancelled) {
            setRemoteUsers([...client.remoteUsers]);
          }
        });

        const uid = await client.join(
          connection.appId,
          connection.channelName,
          connection.token,
          null,
        );

        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();

        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        await client.publish([audioTrack, videoTrack]);

        if (localVideoContainerRef.current) {
          videoTrack.play(localVideoContainerRef.current);
        }

        if (!isCancelled) {
          setIsJoined(true);
          setConnectionStatus("connected");
          setRemoteUsers([...client.remoteUsers]);
          console.info("Agora joined with uid", uid);
        }
      } catch (error) {
        if (!isCancelled) {
          setRtcError(
            error instanceof Error
              ? error.message
              : "Failed to initialize video session",
          );
          setConnectionStatus("failed");
        }
      }
    };

    void initializeAgora();

    return () => {
      isCancelled = true;
      hasInitializedRef.current = false;
      void cleanupAgora();
    };
  }, [cleanupAgora, connection, liveSession]);

  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        const element = document.getElementById(
          `remote-video-${String(user.uid)}`,
        );
        if (element) {
          user.videoTrack.play(element);
        }
      }

      if (user.audioTrack) {
        user.audioTrack.play();
      }
    });
  }, [remoteUsers]);

  const toggleMic = useCallback(async () => {
    const track = localAudioTrackRef.current;
    if (!track) return;

    const next = !isMicOn;
    await track.setEnabled(next);
    setIsMicOn(next);
  }, [isMicOn]);

  const toggleCamera = useCallback(async () => {
    const track = localVideoTrackRef.current;
    if (!track) return;

    const next = !isCameraOn;
    await track.setEnabled(next);

    if (next && localVideoContainerRef.current) {
      track.play(localVideoContainerRef.current);
    }

    setIsCameraOn(next);
  }, [isCameraOn]);

  const leaveSession = useCallback(async () => {
    setIsLeaving(true);
    await cleanupAgora();
    navigate("/dashboard/video-sessions");
  }, [cleanupAgora, navigate]);

  const details = [
    {
      label: "Appointment",
      value: formatDate(liveSession?.appointmentId?.date),
    },
    {
      label: "Time",
      value: liveSession?.appointmentId?.time ?? "-",
    },
    {
      label: "Type",
      value: liveSession?.appointmentId?.appointmentType ?? "-",
    },
    {
      label: "Channel",
      value: connection?.channelName ?? liveSession?.roomName ?? "-",
    },
    {
      label: "Provider",
      value: connection?.provider ?? "-",
    },
  ];

  if (!liveSession) {
    return (
      <Card className="mx-auto mt-4 max-w-xl">
        <CardHeader>
          <CardTitle className="text-lg">Session data not available</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Start a session from the waiting room to load connection details.
          </p>
          <p>Session ID: {sessionId ?? "-"}</p>
          <Button
            asChild
            className="bg-gradient-dash text-white hover:opacity-95"
          >
            <Link to="/dashboard/video-sessions">Back to Video Sessions</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="space-y-3">
        <div className="relative min-h-80 overflow-hidden rounded-xl bg-slate-950 sm:min-h-94">
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
            <Clock3 className="size-3" />
            <span>{isJoined ? "Live" : "Starting"}</span>
          </div>

          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
            <Camera className="size-3" />
            <span>{connectionStatus}</span>
          </div>

          <div className="min-h-80 sm:min-h-94">
            {primaryRemoteUser?.videoTrack ? (
              <div
                id={`remote-video-${String(primaryRemoteUser.uid)}`}
                className="h-full min-h-80 w-full sm:min-h-94"
              />
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center gap-3 sm:min-h-94">
                <Avatar className="size-16 bg-slate-700 text-2xl text-slate-100">
                  <AvatarFallback>{patientInitials || "?"}</AvatarFallback>
                </Avatar>
                <p className="text-lg text-slate-100">{patientName}</p>
                <p className="text-xs text-slate-300">
                  Waiting for patient to join video
                </p>
              </div>
            )}
          </div>

          <div className="absolute bottom-3 right-3 h-24 w-32 overflow-hidden rounded-lg bg-slate-800/55 ring-1 ring-white/10">
            {isCameraOn ? (
              <div ref={localVideoContainerRef} className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Avatar className="size-11 bg-slate-600 text-slate-200">
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>

        {rtcError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {rtcError}
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-2 rounded-xl border bg-card px-3 py-2.5">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={() => void toggleMic()}
            disabled={!isJoined || isLeaving}
          >
            {isMicOn ? (
              <Mic className="size-4" />
            ) : (
              <MicOff className="size-4" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={() => void toggleCamera()}
            disabled={!isJoined || isLeaving}
          >
            {isCameraOn ? (
              <Video className="size-4" />
            ) : (
              <VideoOff className="size-4" />
            )}
          </Button>
          <Button
            size="icon"
            className="rounded-full bg-red-600 text-white hover:bg-red-600/90"
            onClick={() => void leaveSession()}
            disabled={isLeaving}
          >
            <PhoneOff className="size-4" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full">
            <MessageSquare className="size-4" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full">
            <FilePlus2 className="size-4" />
          </Button>
        </div>
      </div>

      <Card className="py-0">
        <CardHeader className="border-b py-3">
          <CardTitle className="text-sm font-semibold">Session Notes</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 py-3">
          <Textarea
            placeholder="Take notes during the session..."
            className="min-h-60 resize-none"
          />

          <Button className="h-9 w-full bg-gradient-dash text-white hover:opacity-95">
            Save Notes
          </Button>

          <div className="space-y-2 border-t pt-3 text-sm">
            <p className="font-medium text-slate-700">Patient Info</p>

            {details.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
