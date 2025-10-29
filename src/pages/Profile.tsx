import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Mail,
  Calendar,
  MapPin,
  Shield,
  User,
  Loader2,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AxiosHelper from "@/helpers/axiosHelper";
import UserService from "@/service/userService";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [filesData, setFilesData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState();
  const [status, setStatus] = useState("cancelled"); // cancelled, approved
  // const {} = useAuth();

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const userRes = await UserService.getProfile();
        setUser(userRes.data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => {};
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await AxiosHelper.getData(`/files/file-list/${status}`);
      console.log("files data is here : ", res.data.data);
      setFilesData(res.data.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  // Upload file handler
  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      const res = await AxiosHelper.postData("/files/upload", formData, true);
      console.log("res.data : ", res.data);
      if (res.data.status) {
        toast.success("File uploaded successfully.");
        fetchFiles();
      }
      setFile(null);
      // setFilesData((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // Filtered list
  const filteredFiles = filesData;
  // filter === "all" ? filesData : filesData.filter((f) => f.status === filter);

  useEffect(() => {
    fetchFiles();
  }, [status]);

  // Mock user data - in real app this would come from backend
  // const user = {
  //   name: "John Doe",
  //   email: "john.doe@example.com",
  //   joinDate: "January 2024",
  //   location: "San Francisco, CA",
  //   role: "Premium User",
  //   avatar: "JD",
  //   stats: {
  //     chats: 47,
  //     messages: 1250,
  //     tokens: "125.5K",
  //   },
  // };

  return isLoading ? (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">Loading profile...</div>
    </div>
  ) : (
    user && (
      <>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b border-border bg-card p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="sm"
                  variant="ghost"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-2xl font-semibold">Profile</h1>
              </div>

              <Button
                onClick={() => navigate("/settings")}
                className="bg-gradient-primary hover:opacity-90 shadow-glow"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </header>

          {/* Profile Content */}
          <main className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Profile Header Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  <Avatar className="w-24 h-24 border-4 border-primary/20">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-bold">
                      {user?.username.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-2">{user.username}</h2>
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4 text-muted-foreground mb-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-primary">
                    {user.chatsCount}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Total Chats</p>
                </CardContent>
              </Card>

              {/* <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">
                {user.stats.messages}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Messages Sent</p>
            </CardContent>
          </Card> */}

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-primary">
                    {user.tokens}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Tokens Used</p>
                </CardContent>
              </Card>
            </div>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Personal Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Full Name:
                        </span>
                        <span>{user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{user.email}</span>
                      </div>
                      {/* <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{user.location}</span>
                  </div> */}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Account Status</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Account Type:
                        </span>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Member Since:
                        </span>
                        <span>{user.joinDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Upload New Pdf</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Upload Section */}
                <div className="p-4 rounded-lg border bg-muted/40 flex flex-col sm:flex-row items-center gap-3">
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || !file}
                    className="w-full sm:w-auto"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" /> Upload
                      </>
                    )}
                  </Button>
                </div>

                <hr className="my-2"></hr>
                <h1 className="text-xl my-6">Previously uploaded PDFs</h1>
                <hr className="my-2"></hr>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {["pending", "approved", "cancelled"].map((filter) => (
                    <Button
                      key={filter}
                      variant={filter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatus(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  ))}
                </div>

                {/* Files List */}
                <div className="space-y-3">
                  {filteredFiles.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No files found.
                    </p>
                  ) : (
                    filteredFiles.map((file) => (
                      <div
                        key={file._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            {file.originalName || "Unnamed File"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded by {file.userId?.username} •{" "}
                            {new Date(file.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                          // variant={
                          //   file.status === "approved"
                          //     ? "success"
                          //     : file.status === "pending"
                          //     ? "secondary"
                          //     : "destructive"
                          // }
                          >
                            {file.status}
                          </Badge>
                          <a
                            href={`http://localhost:5000/api${file.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary underline hover:no-underline"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </>
    )
  );
};

export default Profile;
