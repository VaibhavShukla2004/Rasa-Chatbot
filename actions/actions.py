from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher


class ActionHandleHelpful(Action):
    def name(self) -> Text:
        return "action_handle_helpful"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        dispatcher.utter_message(text="Glad I could help!")
        dispatcher.utter_message(json_message={"end_chat": True})
        return []


class ActionHandleNotHelpful(Action):
    def name(self) -> Text:
        return "action_handle_not_helpful"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        dispatcher.utter_message(text="You can reach out to our helpdesk at 📞 011 24665534 or 📧 ntrp-helpdesk@gov.in")
        dispatcher.utter_message(json_message={"end_chat": True})
        return []
