/**
 * Technician Selector Component
 * Dropdown for selecting technicians with smart assignment recommendations
 */

import { useState, useEffect } from 'react';
import { Search, User, Loader2, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import {
  getAllTechnicians,
  getAvailableTechnicians,
  getAssignmentRecommendations,
  type TechnicianProfile,
} from '@/services/technicianService';
import type { TechnicianSkill, JobComplexity, AssignmentRecommendation, TechnicianMetadata } from '@/types/technician';
import { TECHNICIAN_LEVEL_LABELS, SKILL_LABELS, TECHNICIAN_LEVEL_COLORS } from '@/types/technician';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TechnicianSelectorProps {
  onSelect: (technicianId: string, technicianName: string) => void;
  selectedTechnicianId?: string;

  // Optional: For smart recommendations
  requiredSkills?: TechnicianSkill[];
  serviceArea?: string;
  jobComplexity?: JobComplexity;

  // Optional: Filter options
  showOnlyAvailable?: boolean;
  showRecommendations?: boolean;
}

export function TechnicianSelector({
  onSelect,
  selectedTechnicianId,
  requiredSkills = [],
  serviceArea = '',
  jobComplexity = 'moderate',
  showOnlyAvailable = true,
  showRecommendations = true,
}: TechnicianSelectorProps) {
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [recommendations, setRecommendations] = useState<AssignmentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'dropdown' | 'list'>('dropdown');

  useEffect(() => {
    loadTechnicians();
  }, [showOnlyAvailable]);

  useEffect(() => {
    if (showRecommendations && requiredSkills.length > 0 && serviceArea) {
      loadRecommendations();
    }
  }, [requiredSkills, serviceArea, jobComplexity, showRecommendations]);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      const data = showOnlyAvailable
        ? await getAvailableTechnicians()
        : await getAllTechnicians();
      setTechnicians(data);
    } catch (error) {
      console.error('Error loading technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recs = await getAssignmentRecommendations(
        requiredSkills,
        serviceArea,
        jobComplexity,
        10
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const filteredTechnicians = technicians.filter((tech) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const metadata = (tech.metadata || {}) as Partial<TechnicianMetadata>;
    const level = metadata.level ? metadata.level.toLowerCase() : '';
    return (
      (tech.displayName || '').toLowerCase().includes(searchLower) ||
      (tech.email || '').toLowerCase().includes(searchLower) ||
      level.includes(searchLower)
    );
  });

  const selectedTechnician = technicians.find(t => t.uid === selectedTechnicianId);

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'dropdown' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('dropdown')}
        >
          Dropdown
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          List View
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          <span className="ml-2 text-neutral-600">Loading technicians...</span>
        </div>
      ) : viewMode === 'dropdown' ? (
        /* Dropdown Mode */
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Select Technician
          </label>
          <Select value={selectedTechnicianId} onValueChange={(value) => {
            const tech = technicians.find(t => t.uid === value);
            if (tech) {
              onSelect(tech.uid, tech.displayName);
            }
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a technician..." />
            </SelectTrigger>
            <SelectContent>
              {filteredTechnicians.length === 0 ? (
                <div className="px-4 py-6 text-center text-neutral-500">
                  No {showOnlyAvailable ? 'available ' : ''}technicians found
                </div>
              ) : (
                filteredTechnicians.map((tech) => {
                  const metadata = (tech.metadata || {}) as Partial<TechnicianMetadata>;
                  const level = metadata.level ?? 'technician';
                  const currentJobs = Array.isArray(metadata.currentJobIds) ? metadata.currentJobIds.length : 0;
                  const maxJobs = metadata.maxJobsPerDay ?? 8;
                  const isAvailable = (metadata.availabilityStatus ?? 'available') === 'available';

                  return (
                    <SelectItem key={tech.uid} value={tech.uid}>
                      <div className="flex items-center justify-between w-full py-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-neutral-500" />
                          <div>
                            <div className="font-medium">{tech.displayName}</div>
                            <div className="text-xs text-neutral-500">
                              {TECHNICIAN_LEVEL_LABELS[level]} • {currentJobs}/{maxJobs} jobs
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAvailable ? (
                            <Badge variant="success" className="text-xs">Available</Badge>
                          ) : (
                            <Badge variant="warning" className="text-xs">Busy</Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>

          {selectedTechnician && (
            <TechnicianCard technician={selectedTechnician} />
          )}
        </div>
      ) : (
        /* List View with Recommendations */
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search technicians..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Recommendations Section */}
          {showRecommendations && recommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success-500" />
                Recommended Matches
              </h3>
              <div className="space-y-2">
                {recommendations.slice(0, 5).map((rec) => {
                  const tech = technicians.find(t => t.uid === rec.technicianId);
                  if (!tech) return null;

                  return (
                    <RecommendationCard
                      key={rec.technicianId}
                      technician={tech}
                      recommendation={rec}
                      isSelected={selectedTechnicianId === rec.technicianId}
                      onSelect={() => onSelect(rec.technicianId!, rec.technicianName!)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* All Technicians */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-500" />
              All {showOnlyAvailable ? 'Available ' : ''}Technicians ({filteredTechnicians.length})
            </h3>
            <div className="space-y-2">
              {filteredTechnicians.map((tech) => (
                <TechnicianListItem
                  key={tech.uid}
                  technician={tech}
                  isSelected={selectedTechnicianId === tech.uid}
                  onSelect={() => onSelect(tech.uid, tech.displayName)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Technician Card - Shows details of selected technician
 */
function TechnicianCard({ technician }: { technician: TechnicianProfile }) {
  const metadata = (technician.metadata || {}) as Partial<TechnicianMetadata>;
  const level = metadata.level ?? 'technician';
  const experienceYears = metadata.yearsOfExperience ?? 0;
  const currentJobs = Array.isArray(metadata.currentJobIds) ? metadata.currentJobIds.length : 0;
  const maxJobs = metadata.maxJobsPerDay ?? 8;
  const rating = metadata.averageRating;
  const ratingDisplay =
    typeof rating === 'number' ? `${rating.toFixed(1)}⭐` : 'N/A';
  const skills = metadata.skills || [];

  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-neutral-900">{technician.displayName}</h4>
          <p className="text-sm text-neutral-600">{technician.email}</p>
        </div>
        <Badge className={TECHNICIAN_LEVEL_COLORS[level]}>
          {TECHNICIAN_LEVEL_LABELS[level]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-neutral-600">Experience:</span>
          <span className="ml-1 font-medium">{experienceYears} years</span>
        </div>
        <div>
          <span className="text-neutral-600">Current Jobs:</span>
          <span className="ml-1 font-medium">
            {currentJobs}/{maxJobs}
          </span>
        </div>
        <div>
          <span className="text-neutral-600">Rating:</span>
          <span className="ml-1 font-medium">{ratingDisplay}</span>
        </div>
        <div>
          <span className="text-neutral-600">Completed:</span>
          <span className="ml-1 font-medium">{metadata.totalJobsCompleted ?? 0} jobs</span>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-neutral-600 mb-1">Skills:</p>
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {SKILL_LABELS[skill]}
              </Badge>
            ))}
            {skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{skills.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Recommendation Card - Shows recommended technician with match score
 */
function RecommendationCard({
  technician,
  recommendation,
  isSelected,
  onSelect,
}: {
  technician: TechnicianProfile;
  recommendation: AssignmentRecommendation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const metadata = (technician.metadata || {}) as Partial<TechnicianMetadata>;
  const level = metadata.level ?? 'technician';

  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left p-3 rounded-lg border-2 transition-all
        ${isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-25'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success-100 text-success-700 font-bold">
            {recommendation.matchScore}
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900">{technician.displayName}</h4>
            <p className="text-xs text-neutral-600">
              {TECHNICIAN_LEVEL_LABELS[level]} • {recommendation.currentWorkload} active jobs
            </p>
          </div>
        </div>
        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary-600" />}
      </div>

      <div className="space-y-1">
        {recommendation.reasons.map((reason, idx) => (
          <p key={idx} className="text-xs text-success-700">
            {reason}
          </p>
        ))}
      </div>
    </button>
  );
}

/**
 * Technician List Item - Shows technician in list view
 */
function TechnicianListItem({
  technician,
  isSelected,
  onSelect,
}: {
  technician: TechnicianProfile;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const metadata = (technician.metadata || {}) as Partial<TechnicianMetadata>;
  const level = metadata.level ?? 'technician';
  const currentJobs = Array.isArray(metadata.currentJobIds) ? metadata.currentJobIds.length : 0;
  const maxJobs = metadata.maxJobsPerDay ?? 8;
  const availability = metadata.availabilityStatus ?? 'available';
  const isAvailable = availability === 'available';

  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left p-3 rounded-lg border-2 transition-all
        ${isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-neutral-500" />
          <div>
            <h4 className="font-medium text-neutral-900">{technician.displayName}</h4>
            <p className="text-xs text-neutral-600">
              {TECHNICIAN_LEVEL_LABELS[level]} • {currentJobs}/{maxJobs} jobs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <div className="flex items-center gap-1 text-success-600">
              <div className="w-2 h-2 rounded-full bg-success-500"></div>
              <span className="text-xs font-medium">Available</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-warning-600">
              <div className="w-2 h-2 rounded-full bg-warning-500"></div>
              <span className="text-xs font-medium">Busy</span>
            </div>
          )}
          {isSelected && <CheckCircle2 className="h-5 w-5 text-primary-600" />}
        </div>
      </div>
    </button>
  );
}
