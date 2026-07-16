import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useCreateFloor, useCreateTower, useFloors, useProject } from "@/features/properties/hooks/useProperties";
import { paths } from "@/routes/paths";

export function ProjectTowersPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: project, isLoading } = useProject(uuid!);
  const [towerName, setTowerName] = useState("");
  const [numberOfFloors, setNumberOfFloors] = useState("0");
  const [selectedTowerUuid, setSelectedTowerUuid] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const createTower = useCreateTower(uuid!);
  const createFloor = useCreateFloor(selectedTowerUuid);
  const { data: floors = [] } = useFloors(selectedTowerUuid);

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Building2} tone="indigo" title="Tower Management" description="Configure towers and floors for the selected project." action={<Button variant="outline" asChild><Link to={paths.projects.details(uuid!)}>Back to Project</Link></Button>} />
      {isLoading ? <Loading label="Loading project..." /> : null}
      {project ? (
        <>
          <Card><CardHeader><CardTitle>Add Tower — {project.projectName}</CardTitle></CardHeader><CardContent className="flex flex-col gap-3 md:flex-row"><Input placeholder="Tower name" value={towerName} onChange={(e) => setTowerName(e.target.value)} /><Input type="number" placeholder="Number of floors" value={numberOfFloors} onChange={(e) => setNumberOfFloors(e.target.value)} /><Button onClick={() => createTower.mutate({ towerName, numberOfFloors: Number(numberOfFloors) }, { onSuccess: () => { setTowerName(""); setNumberOfFloors("0"); } })}>Add Tower</Button></CardContent></Card>
          <div className="grid gap-4 md:grid-cols-2">{project.towers.map((tower) => (
            <Card key={tower.uuid}><CardContent className="p-6"><h3 className="font-semibold">{tower.towerName}</h3><p className="text-sm text-muted-foreground">{tower.numberOfFloors} planned floors • {tower.floorCount} configured • {tower.unitCount} units</p><Button className="mt-3" variant="outline" onClick={() => setSelectedTowerUuid(tower.uuid)}>Manage Floors</Button></CardContent></Card>
          ))}</div>
          {selectedTowerUuid ? (
            <Card><CardHeader><CardTitle>Floor Management</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex gap-3"><Input type="number" placeholder="Floor number" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} /><Button onClick={() => createFloor.mutate({ floorNumber: Number(floorNumber) }, { onSuccess: () => setFloorNumber("") })}>Add Floor</Button></div><div className="space-y-2">{floors.map((floor) => <div key={floor.uuid} className="rounded-lg border p-3 text-sm">Floor {floor.floorNumber} • {floor.unitCount} units</div>)}</div></CardContent></Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
