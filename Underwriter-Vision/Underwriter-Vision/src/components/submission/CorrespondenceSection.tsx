import { useState } from "react";
import { Mail, MessageSquare, CheckSquare, Flag, ArrowUpRight } from "lucide-react";
import { inboxEmails, notes, tasks, approvals } from "../../lib/mockData";

export function CorrespondenceSection() {
  const [activeTab, setActiveTab] = useState("emails");

  return (
    <div className="flex gap-6 h-[800px]">
      <div className="w-1/4">
        <div className="glass-panel bg-white rounded-2xl p-4 border border-border shadow-sm space-y-2">
          <button 
            onClick={() => setActiveTab('emails')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'emails' ? 'bg-secondary/80 text-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/50'}`}
          >
            <div className="flex items-center gap-3">
              <Mail size={18} />
              <span>Broker Emails</span>
            </div>
            <span className="bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded text-xs font-bold">2</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('notes')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'notes' ? 'bg-secondary/80 text-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/50'}`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={18} />
              <span>Internal Notes</span>
            </div>
            <span className="bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded text-xs font-bold">2</span>
          </button>

          <button 
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-secondary/80 text-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/50'}`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare size={18} />
              <span>Tasks</span>
            </div>
            <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded text-xs font-bold">2 Open</span>
          </button>

          <button 
            onClick={() => setActiveTab('approvals')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'approvals' ? 'bg-secondary/80 text-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/50'}`}
          >
            <div className="flex items-center gap-3">
              <Flag size={18} />
              <span>Approvals</span>
            </div>
            <span className="bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded text-xs font-bold">1</span>
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
        {activeTab === 'emails' && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
              <h3 className="font-display font-bold text-foreground">Broker Correspondence</h3>
              <button className="text-sm font-bold text-brand-blue hover:underline flex items-center gap-2">
                <ArrowUpRight size={16} /> Compose Email
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {inboxEmails.map((email, i) => (
                <div key={i} className="p-4 border border-border rounded-xl bg-white hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-foreground">{email.sender}</span>
                    <span className="text-xs text-muted-foreground">{email.time}</span>
                  </div>
                  <p className="font-medium text-sm text-foreground mb-2">{email.subject}</p>
                  <p className="text-sm text-muted-foreground">{email.preview}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
              <h3 className="font-display font-bold text-foreground">Underwriter Notes</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notes.map((note, i) => (
                <div key={i} className="p-4 border border-border rounded-xl bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center font-bold text-xs">
                        {note.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{note.author}</p>
                        <p className="text-xs text-muted-foreground">{note.role}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border bg-secondary/5">
              <div className="flex gap-3">
                <input type="text" placeholder="Add a note..." className="flex-1 bg-white border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-foreground" />
                <button className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-brand-blue-dark">Add</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
              <h3 className="font-display font-bold text-foreground">Tasks</h3>
              <button className="text-sm font-bold text-brand-blue hover:underline">New Task</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Task</th>
                    <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee</th>
                    <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${task.type === 'Review' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                          {task.type}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-medium text-foreground">{task.title}</td>
                      <td className="py-3 text-sm text-muted-foreground">User</td>
                      <td className="py-3 text-sm text-muted-foreground">{task.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
              <h3 className="font-display font-bold text-foreground">Approvals</h3>
              <button className="text-sm font-bold text-brand-blue hover:underline">Request Approval</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {approvals.map((ap) => (
                <div key={ap.id} className="p-4 border border-border rounded-xl bg-white shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono font-bold text-muted-foreground">{ap.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ap.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {ap.status}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-foreground">{ap.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Approver: {ap.approver}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}