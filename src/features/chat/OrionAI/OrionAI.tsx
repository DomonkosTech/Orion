import React, { useState } from 'react';
import './OrionAI.module.css';
import { OrionAI as OrionAIApi, type Job } from '../../../Api/advertisementApi';
import { useNavigate } from 'react-router-dom';

interface OrionAIProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrionAI: React.FC<OrionAIProps> = ({ isOpen, onClose }) => {
    const [userInput, setUserInput] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!userInput.trim()) return;
        setLoading(true);
        setSearched(false);
        try {
            const response = await OrionAIApi(userInput);
            if (response.success && Array.isArray(response.data)) {
                setJobs(response.data);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error("OrionAI search error:", error);
            setJobs([]);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    const handleJobClick = (id: number) => {
        navigate(`/job/show/${id}`);
        onClose();
    };

    return (
        <div className="orion-ai-overlay" onClick={onClose}>
            <div className="orion-ai-window" onClick={(e) => e.stopPropagation()}>
                <div className="orion-ai-header">
                    <h2 className="orion-ai-title">✨ Orion <span>AI</span></h2>
                    <button className="orion-ai-close" onClick={onClose}>&times;</button>
                </div>
                
                <div className="orion-ai-input-group">
                    <input
                        type="text"
                        className="orion-ai-input"
                        placeholder="Mit keresel? Írd le a saját szavaiddal..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button 
                        className="orion-ai-button" 
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? 'Keresés...' : 'Küldés'}
                    </button>
                </div>

                <div className="orion-ai-results">
                    {searched && jobs.length === 0 && (
                        <div className="orion-ai-no-results">
                            Sajnos nem találtam a leírásnak megfelelő munkát. Próbáld meg másképp megfogalmazni!
                        </div>
                    )}
                    
                    {jobs.map((job) => (
                        <div key={job.id} className="orion-ai-job-item" onClick={() => handleJobClick(job.id)}>
                            <div className="orion-ai-job-title">{job.title}</div>
                            <div className="orion-ai-job-details">
                                <span>{job.location}</span>
                                <span>•</span>
                                <span className="orion-ai-job-wage">{job.hourly_wage} Ft/óra</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrionAI;
