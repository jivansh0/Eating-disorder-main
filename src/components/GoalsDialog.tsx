import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: string[];
  onSaveGoals: (goals: string[]) => void;
}

const GoalsDialog: React.FC<GoalsDialogProps> = ({
  open,
  onOpenChange,
  goals,
  onSaveGoals,
}) => {
  // Initialize with an empty array, we'll set it from props when dialog opens
  const [editedGoals, setEditedGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const { toast } = useToast();

  // Reset and sync with props when dialog opens
  useEffect(() => {
    if (open) {
      // Create a new array to ensure we're not modifying the original
      setEditedGoals(Array.isArray(goals) ? [...goals] : []);
      console.log("Dialog opened, setting goals:", Array.isArray(goals) ? [...goals] : []);
    }
  }, [open, goals]);

  const handleAddGoal = () => {
    if (newGoal.trim() === "") {
      toast({
        title: "Empty goal",
        description: "Please enter a goal",
        variant: "destructive",
      });
      return;
    }

    // Create a new array with all existing goals plus the new one
    const updatedGoals = [...editedGoals, newGoal.trim()];
    setEditedGoals(updatedGoals);
    setNewGoal(""); // Clear input field
    
    console.log("Goals after adding:", updatedGoals); // Debug log
  };

  const handleRemoveGoal = (index: number) => {
    const updatedGoals = [...editedGoals];
    updatedGoals.splice(index, 1);
    setEditedGoals(updatedGoals);
    console.log("Goals after removing:", updatedGoals); // Debug log
  };

  const handleEditGoal = (index: number, value: string) => {
    const updatedGoals = [...editedGoals];
    updatedGoals[index] = value;
    setEditedGoals(updatedGoals);
  };

  const handleSave = () => {
    // Filter out any empty goals before saving
    const filteredGoals = editedGoals.filter(goal => goal.trim() !== "");
    console.log("Saving goals:", filteredGoals); // Debug log
    
    // Make sure we're passing an array to the parent component
    onSaveGoals(filteredGoals);
    
    toast({
      title: "Goals updated",
      description: `${filteredGoals.length} ${filteredGoals.length === 1 ? 'goal has' : 'goals have'} been saved successfully`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-healing-800">My Recovery Goals</DialogTitle>
          <DialogDescription>
            View and edit your goals. These goals help track your progress through your recovery journey.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
          {editedGoals.length === 0 ? (
            <p className="text-center text-gray-500 py-4">You haven't set any goals yet. Add your first goal below.</p>
          ) : (
            editedGoals.map((goal, index) => (
              <div key={`goal-${index}`} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <Input 
                    value={goal}
                    onChange={(e) => handleEditGoal(index, e.target.value)}
                    className="border-healing-200"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveGoal(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
        
        <div className="flex space-x-2">
          <Input
            placeholder="Add a new goal..."
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            className="flex-1 border-healing-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddGoal();
              }
            }}
          />
          <Button 
            onClick={handleAddGoal} 
            className="bg-healing-500 hover:bg-healing-600 text-white"
            type="button"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="mt-2 sm:mt-0"
          >
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-healing-600 hover:bg-healing-700 text-white"
          >
            <Save className="h-4 w-4 mr-1" /> Save Goals ({editedGoals.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoalsDialog;
