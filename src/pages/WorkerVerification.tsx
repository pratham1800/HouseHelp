import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Phone,
  MapPin,
  FileText,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Worker {
  id: string;
  name: string;
  phone: string;
  work_type: string;
  status: string;
  created_at: string;
  id_proof_url: string | null;
  years_experience: number;
  languages_spoken: string[];
  preferred_areas: string[];
  residential_address: string | null;
  notes: string | null;
}

const workTypeLabels: Record<string, string> = {
  domestic_help: 'Domestic Help',
  cooking: 'Cooking',
  driving: 'Driving',
  gardening: 'Gardening'
};

const statusColors: Record<string, string> = {
  pending_verification: 'bg-amber-100 text-amber-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  assigned: 'bg-blue-100 text-blue-700'
};

export default function WorkerVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWorkers();
    }
  }, [user]);

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (approve: boolean) => {
    if (!selectedWorker) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('workers')
        .update({
          status: approve ? 'verified' : 'rejected',
          verification_notes: verificationNotes,
          verified_at: new Date().toISOString(),
          verified_by: user?.id
        })
        .eq('id', selectedWorker.id);

      if (error) throw error;

      toast({
        title: approve ? 'Worker Verified' : 'Worker Rejected',
        description: `${selectedWorker.name} has been ${approve ? 'verified' : 'rejected'}.`
      });

      setSelectedWorker(null);
      setVerificationNotes('');
      fetchWorkers();
    } catch (error: any) {
      console.error('Error updating worker:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update worker status',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.phone.includes(searchQuery)
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 section-padding">
          <div className="container-main text-center">
            <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
            <p className="text-muted-foreground mb-6">
              This page is for internal team use only. Please login to continue.
            </p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container-main px-4 md:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/for-workers')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Worker Portal
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <span className="inline-block px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium mb-2">
                  Admin Only
                </span>
                <h1 className="text-3xl font-bold text-foreground">
                  Worker Verification
                </h1>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="card-elevated overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Work Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell className="font-medium">{worker.name}</TableCell>
                        <TableCell>{worker.phone}</TableCell>
                        <TableCell>{workTypeLabels[worker.work_type] || worker.work_type}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[worker.status] || 'bg-muted'}>
                            {worker.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(worker.created_at).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedWorker(worker)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredWorkers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No workers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Worker Detail Modal */}
      <Dialog open={!!selectedWorker} onOpenChange={() => setSelectedWorker(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Worker Details</DialogTitle>
          </DialogHeader>
          
          {selectedWorker && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedWorker.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedWorker.phone}</p>
                  </div>
                </div>
              </div>

              {/* Work Details */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Work Type</span>
                  <span className="font-medium">{workTypeLabels[selectedWorker.work_type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">{selectedWorker.years_experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Languages</span>
                  <span className="font-medium">{selectedWorker.languages_spoken?.join(', ') || 'N/A'}</span>
                </div>
              </div>

              {/* Areas */}
              {selectedWorker.preferred_areas?.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Preferred Areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorker.preferred_areas.map((area: string) => (
                      <Badge key={area} variant="secondary">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Address */}
              {selectedWorker.residential_address && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Residential Address</p>
                  <p className="text-foreground">{selectedWorker.residential_address}</p>
                </div>
              )}

              {/* Notes */}
              {selectedWorker.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Registration Notes
                  </p>
                  <p className="text-foreground bg-muted/50 rounded-lg p-3">{selectedWorker.notes}</p>
                </div>
              )}

              {/* ID Proof */}
              {selectedWorker.id_proof_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">ID Proof</p>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const { data } = await supabase.storage
                        .from('worker-documents')
                        .createSignedUrl(selectedWorker.id_proof_url!, 60);
                      if (data?.signedUrl) {
                        window.open(data.signedUrl, '_blank');
                      }
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View ID Document
                  </Button>
                </div>
              )}

              {/* Verification Section */}
              {selectedWorker.status === 'pending_verification' && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-4">Verification Decision</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Verification Notes
                      </label>
                      <Textarea
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Add notes about verification..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleVerify(true)}
                        disabled={processing}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleVerify(false)}
                        disabled={processing}
                        className="flex-1"
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Already verified/rejected */}
              {selectedWorker.status !== 'pending_verification' && (
                <div className="border-t border-border pt-4">
                  <Badge className={statusColors[selectedWorker.status]}>
                    {selectedWorker.status === 'verified' ? 'Verified' : 
                     selectedWorker.status === 'rejected' ? 'Rejected' : 
                     selectedWorker.status.replace('_', ' ')}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}