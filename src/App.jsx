import { useEffect, useState } from 'react';

function App() {
  const [value, setValue] = useState("");
  const [data, setData] = useState([]);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleClick = async () => {
    if (value.trim()) {
      const newTodo = { value: value, isDone: false };
      setValue(""); // Clear input after adding

      try {
        let r = await fetch("http://localhost:3000/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTodo),
        });

        if (r.ok) {
          let res = await r.json();
          setData((prevData) => [...prevData, res]); // Only update after successful save
          console.log("Todo added:", res);
        } else {
          console.error("Failed to save to server:", r.statusText);
        }
      } catch (error) {
        console.error("Error saving todos to server:", error);
      }
    }
  };

  // Fetch todos from the server
  async function getFromDB() {
    try {
      let r = await fetch("http://localhost:3000/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      let res = await r.json();
      setData(res); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching data from server:", error);
    }
  }

  async function editTodo(id) {
    const newValue = prompt("Edit Todo:");
    if (newValue) {
      try {
        let r = await fetch(`http://localhost:3000/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: newValue }),
        });

        if (r.ok) {
          let res = await r.json();
          setData((prevData) =>
            prevData.map((todo) =>
              todo._id === id ? { ...todo, value: newValue } : todo
            )
          );
          console.log("Todo edited:", res);
        } else {
          console.error("Failed to save to server:", r.statusText);
        }
      } catch (error) {
        console.error("Error saving todos to server:", error);
      }
    }
  }

  async function deleteTodo(id) {
    try {
      let r = await fetch(`http://localhost:3000/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (r.ok) {
        setData((prevData) => prevData.filter((todo) => todo._id !== id));
        console.log("Todo deleted:", id);
      } else {
        console.error("Failed to delete on server:", r.statusText);
      }
    } catch (error) {
      console.error("Error deleting todo from server:", error);
    }
  }

  useEffect(() => {
    getFromDB(); // Fetch once when the component mounts
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md flex flex-col items-center">
        <input
          className="border border-gray-300 p-2 rounded w-full mb-4"
          onChange={handleChange}
          type="text"
          placeholder="Enter Todo..."
          value={value}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-6"
          onClick={handleClick}
        >
          Add Todo
        </button>

        <ul className="w-full space-y-4">
          {data.map((to) => (
            <li key={to._id} className="flex justify-between items-center border-b pb-2">
              <span>{to.value}</span>
              <div className="flex space-x-3">
                <span
                  className="cursor-pointer"
                  onClick={() => editTodo(to._id)}
                >
                  <lord-icon
                    src="https://cdn.lordicon.com/gwlusjdu.json"
                    trigger="hover"
                    style={{ width: "25px", height: "25px" }}
                  ></lord-icon>
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => deleteTodo(to._id)}
                >
                  <lord-icon
                    src="https://cdn.lordicon.com/skkahier.json"
                    trigger="hover"
                    style={{ width: "25px", height: "25px" }}
                  ></lord-icon>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
