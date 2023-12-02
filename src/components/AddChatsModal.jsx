import { Switch } from "@headlessui/react";
import { Fragment, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import MyComboBox from "./MyComboBox";

const AddChatsModal = ({ isOpen, onClose, onProceed }) => {
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState([]);
  const [groupParticipants, setGroupParticipants] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className={`z-30 ${
        isOpen ? "block" : "hidden"
      } absolute inset-0 flex justify-center backdrop-blur-sm  items-center p-7 `}
    >
      <div className="border-[1.8px] rounded-lg p-4 w-full max-w-lg relative bg-zinc-900 border-white border-opacity-40">
        <div className="flex justify-between">
          <p>Create Chat</p>

          <button onClick={handleClose}>
            <RxCross2 className="text-xl" />
          </button>
        </div>

        <div>
          <Switch.Group as={"div"} className={"my-4 flex items-center gap-4"}>
            <Switch.Label>
              <span className={`${isGroupChat ? "" : "opacity-30"}`}>
                Is it a group chat?
              </span>
            </Switch.Label>
            <Switch
              checked={isGroupChat}
              onChange={setIsGroupChat}
              as={Fragment}
            >
              {({ checked }) => (
                /* Use the `checked` state to conditionally style the button. */
                <button
                  className={`${
                    checked ? "bg-purple-700" : "bg-zinc-700"
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Enable notifications</span>
                  <span
                    className={`${
                      checked ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </button>
              )}
            </Switch>
          </Switch.Group>
        </div>

        {isGroupChat ? (
          <div className="my-4">
            <input
              type="text"
              value={groupName}
              className="block w-full rounded-lg outline-none py-3 px-5 bg-zinc-800 text-white font-light placeholder:text-white/70"
              placeholder="Enter Group Name ..."
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        ) : null}

        <div className="my-4"></div>
      </div>
    </div>
  );
};

export default AddChatsModal;
