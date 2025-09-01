import React from 'react'
import { useState } from 'react'

function EditExpenseForGroup() {


    const [participant, setParticipants] = useState([]);
    const [addParticipant, setAddParticipant] = useState(false);

    const handleAddParticipant = async () => {
        setAddParticipant(true);
    }

    return (

        <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20'>
            <div
                className="bg-white rounded-lg p-6 shadow-lg relative w-[90%] max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <form>
                    {participant.length !== 0 && (participant.map(item => <div>{item.name}---{item.amount}</div>))}
                    <button onClick={handleAddParticipant}>+Add Participant</button>
                </form>

            </div>
        </div>
    )
}

export default EditExpenseForGroup