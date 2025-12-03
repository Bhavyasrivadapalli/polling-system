import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Teacher from "./pages/Teacher/Teacher";
import Student from "./pages/Student/Student";
import AddQuestion from "./pages/Teacher/AddQuestion";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teacher" element={<Teacher />} />
      <Route path="/student" element={<Student />} />
      <Route path="/teacher/add-question" element={<AddQuestion />} />
    </Routes>
  );
}

export default App;
