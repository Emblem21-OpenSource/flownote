// Allow access to all Nodes, Flows, and named Instances from customNodes.flow
import 'custom.flow'

// Create Nodes that execute a series of Actions
node getClick = extractClickData, extractPlayerId
node extractXY = getXYCoordsFromClickData
node movePlayer = getPlayerById, detectPlayerMovementEvents, movePlayer, dispatchPlayerMovementEvents
node displayBoundaryError = getPlayerById, sendBoundaryError
node notifyRoom = getBroadcastMessage, getRoomByPlayerId, broadcastToRoom

// Create a Flow that can be accessed via GET /click
// The getClick Node has been silenced ($) and will not emit events.
// getClick connects via a StandardChannel (->) to an extractXY Node.
// The extractXY Node is given an instance name of "clickBranch"
flow click(GET /click) = getClick$ -> extractXY#clickBranch

// Using the "clickBranch" instance name, we attach a Coordinates Channel (-Coordinates>) to the extractXY Node within the click Flow.
// Then we connect the Coordinates Channel to a movePlayer Node and allow the Channel to retry exceptions from movePlayer three times.
// The movePlayer Node is given an instance name of "move".
// The movePlayer also will have a Milestone after it to commit all accumulated Actions.
clickBranch -Coordinates{ retry: 3 }> movePlayer#move*

// Using the "clickBranch" instance name, we attach an ErrorChannel (-ErrorChannel!) to the extractXY Node within the click Flow that accepts BoundaryErrors.
// Attach a displayError to the ErrorChannel.
clickBranch -BoundaryError! displayBoundaryError

// Using the "clickBranch" instance name, we attach a notifyRoom node to the extractXY in the click Flow via a StandardChannel. (->)
// Ensure that notifyRoom waits (...) for the movePlayer Node within the click Flow to complete before performing its actions.
clickBranch -> notifyRoom ... move

Get Click Node is Extract Click Data and Extract Player Id
Extract X Y Node is Get X Y Coords From Click Data
Move Player Node is Get Player By Id, Detect Player Movement Events, Move Player, and Dispatch Player Movement Events
Display Boundary Error Node is Get Player By Id and Send Boundary Error
Notify Room Node is Get Broadcast Message, Get Room By Player Id, and Broadcast To Room

Click Flow (GET /click) is a quieted Get Click that connects to Extract X Y (as Click Branch)
Click Branch connects with coordinates to Move Player (as Move) then commits
Click Branch errors with boundary error to Display Boundary Error
Click Branch connects to Notify Room and waits for Move
