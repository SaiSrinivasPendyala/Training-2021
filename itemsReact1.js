
function syllabusForm(fields) {
    return (
        <>
            {/* <label>Syllabus-{index}</label> */}
            <input type="text" value={fields.syllabusData.title}></input><br></br>
            <input type="text" value={fields.syllabusData.description}></input><br></br>
            <button>Save</button>
            <button>Cancel</button>
        </>
    );
}

function syllabusCard(fields) {
    return (
        <>
            {/* <h1>Syllabus-{index}</h1> */}
            <p>{fields.syllabusData.title}</p><br></br>
            <p>{fields.syllabusData.description}</p><br></br>
            <button>Edit</button>
            <button>Delete</button>
        </>
    );
}

function App() {
    const title = "Welcome to Oxford!";
    const syllabusItems = [
        {
            title: "Week1",
            description: "Learn Vuejs",
            editMode: false
        },
        {
            title: "Week2",
            description: "Learn Movie Making",
            editMode: true
        },
        {
            title: "Week3",
            description : "Learn about Global Warming",
            editMode: true
        }
    ];
    return (
        <>
            <h1>{title}</h1>
            {syllabusItems.map((syllabusItem) => {
                if(syllabusItem.editMode == false) {
                    return (
                        <syllabusCard syllabusData={syllabusItem}></syllabusCard>
                    );
                }
                if(syllabusItem.editMode == true) {
                    return (
                        <syllabusForm syllabusData={syllabusItem}></syllabusForm>
                    );
                }
            })}
        </>
    );
}

export default App;