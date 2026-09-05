import { useDashboardData } from '../DashboardData'
import FeatherLoading from '@/components/ui/FeatherLoading'

export default function DashboardDataState() {
  const { loading, error, refetch } = useDashboardData()
  if (loading) {
    return (
      <div className="py-8">
        <FeatherLoading
          variant="card"
          message="Cargando tus movimientos…"
        />
      </div>
    )
  }
  if (error) return <div role="alert" className="py-5 text-sm"><p>No pudimos cargar los movimientos.</p><button onClick={refetch} className="mt-2 min-h-11 underline underline-offset-4">Volver a cargar</button></div>
  return null
}

