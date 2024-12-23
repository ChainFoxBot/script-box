import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, AlertCircle, XCircle, Settings, ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react'
import { Modal } from './modal'

type ServiceStatus = 'operational' | 'planned-maintenance' | 'major-outage'

interface ServiceFailure {
  time: string
  affectedAreas: string[]
  resolution?: string
}

interface MonitoringSettings {
  checkInterval: number
  alertThreshold: number
  notificationsEnabled: boolean
  maxToleranceTime: number
}

interface Service {
  id: string
  name: string
  status: ServiceStatus
  description: string
  lastIncident?: ServiceFailure
  monitoringSettings: MonitoringSettings
  duration?: string
  api?: string
  maintainOwner?: string
  appKeyValidityDate?: string
}

interface HistoryEvent {
  id: string
  date: string
  title: string
  status: ServiceStatus
  description: string
  startTime: string
  endTime: string
}

const statusIcons = {
  'operational': <CheckCircle className="text-green-500" />,
  'planned-maintenance': <AlertCircle className="text-yellow-500" />,
  'major-outage': <XCircle className="text-red-500" />
}

const statusText = {
  'operational': '正常运行',
  'planned-maintenance': '计划维护',
  'major-outage': '重大故障'
}

export default function ServiceStatusPage() {
  const [services, setServices] = useState<Service[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [settingsModalOpen, setSettingsModalOpen] = useState<string | null>(null)
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([])

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const mockServices: Service[] = [
      { 
        id: '1', 
        name: '网站', 
        status: 'operational', 
        description: '主网站和所有子域名',
        lastIncident: {
          time: '2023-06-15T10:30:00Z',
          affectedAreas: ['用户登录', '产品页面'],
          resolution: '服务器重启解决了问题'
        },
        monitoringSettings: {
          checkInterval: 60,
          alertThreshold: 3,
          notificationsEnabled: true,
          maxToleranceTime: 1000
        },
        api: 'https://api.example.com/v1',
        maintainOwner: '张三',
        appKeyValidityDate: '2023-12-31',
      },
      { 
        id: '2', 
        name: 'API', 
        status: 'planned-maintenance', 
        description: 'REST和GraphQL API',
        lastIncident: {
          time: '2023-06-20T14:45:00Z',
          affectedAreas: ['支付处理', '用户数据检索'],
        },
        monitoringSettings: {
          checkInterval: 30,
          alertThreshold: 2,
          notificationsEnabled: true,
          maxToleranceTime: 500
        },
        duration: '2小时',
        api: 'https://api.example.com/v2',
        maintainOwner: '李四',
        appKeyValidityDate: '2024-06-30',
      },
      { 
        id: '3', 
        name: '数据库', 
        status: 'operational', 
        description: '主数据库和副本数据库',
        monitoringSettings: {
          checkInterval: 120,
          alertThreshold: 1,
          notificationsEnabled: true,
          maxToleranceTime: 2000
        }
      },
      { 
        id: '4', 
        name: '身份验证', 
        status: 'operational', 
        description: '用户身份验证和授权',
        monitoringSettings: {
          checkInterval: 60,
          alertThreshold: 2,
          notificationsEnabled: true,
          maxToleranceTime: 1000
        }
      },
      { 
        id: '5', 
        name: '文件存储', 
        status: 'major-outage', 
        description: '文件上传和检索服务',
        lastIncident: {
          time: '2023-06-22T09:15:00Z',
          affectedAreas: ['文件上传', '文件下载', '备份服务'],
        },
        monitoringSettings: {
          checkInterval: 300,
          alertThreshold: 5,
          notificationsEnabled: true,
          maxToleranceTime: 3000
        },
        duration: '30分钟'
      },
    ]

    setServices(mockServices)

    const mockHistoryEvents: HistoryEvent[] = [
      {
        id: '1',
        date: '2024-01-15',
        title: '系统升级维护',
        status: 'planned-maintenance',
        description: '计划进行系统升级，预计维护时间2小时',
        startTime: '09:00',
        endTime: '12:00'
      },
      {
        id: '2',
        date: '2024-01-10',
        title: '服务器故障',
        status: 'major-outage',
        description: '主服务器发生故障，影响系统访问',
        startTime: '14:00',
        endTime: '16:00'
      },
      {
        id: '3',
        date: '2024-01-05',
        title: '性能优化',
        status: 'planned-maintenance',
        description: '对数据库进行性能优化，提升查询效率',
        startTime: '10:00',
        endTime: '11:30'
      },
      {
        id: '4',
        date: '2024-01-01',
        title: '例行维护',
        status: 'planned-maintenance',
        description: '进行年度系统维护和安全检查',
        startTime: '08:00',
        endTime: '09:00'
      }
    ]
    setHistoryEvents(mockHistoryEvents)
    setLastUpdated(new Date().toLocaleString('zh-CN'))
  }, [])

  const toggleExpand = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  const updateServiceSettings = (serviceId: string, newSettings: MonitoringSettings) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.id === serviceId 
          ? { ...service, monitoringSettings: newSettings }
          : service
      )
    )
    setSettingsModalOpen(null)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>服务状态</CardTitle>
          <CardDescription>我们服务的当前状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="rounded-lg bg-gray-100 overflow-hidden">
                <div className="flex items-center space-x-4 p-4">
                  <div className="flex-shrink-0">
                    {statusIcons[service.status]}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold">数据中心-成本改进率</h3>
                    <p className="text-sm text-gray-600">接口简单描述</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      service.status === 'operational' ? 'text-green-600' :
                      service.status === 'planned-maintenance' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {statusText[service.status]}
                    </span>
                    {(service.status === 'planned-maintenance' || service.status === 'major-outage') && service.duration && (
                      <span className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration}
                      </span>
                    )}
                    <Button variant="outline" size="sm" onClick={() => toggleExpand(service.id)}>
                      {expandedService === service.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <span className="sr-only">{expandedService === service.id ? '隐藏' : '显示'}详情</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSettingsModalOpen(service.id)}>
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">设置</span>
                    </Button>
                  </div>
                </div>
                {expandedService === service.id && (
                  <div className="px-4 pb-4 bg-white">
                    <h4 className="font-semibold mb-2">服务详情</h4>
                    <p><strong>当前状态：</strong> {statusText[service.status]}</p>
                    {service.duration && (
                      <p><strong>预计持续时间：</strong> {service.duration}</p>
                    )}
                    {service.api && (
                      <p><strong>服务API：</strong> {service.api}</p>
                    )}
                    {service.maintainOwner && (
                      <p><strong>维护负责人：</strong> {service.maintainOwner}</p>
                    )}
                    {service.appKeyValidityDate && (
                      <p><strong>AppKey有效期：</strong> {service.appKeyValidityDate}</p>
                    )}
                    {service.lastIncident ? (
                      <>
                        <h5 className="font-semibold mt-2 mb-1">最近事件</h5>
                        <p><strong>时间：</strong> {new Date(service.lastIncident.time).toLocaleString('zh-CN')}</p>
                        <p><strong>受影响区域：</strong> {service.lastIncident.affectedAreas.join('、')}</p>
                        {service.lastIncident.resolution && (
                          <p><strong>解决方案：</strong> {service.lastIncident.resolution}</p>
                        )}
                      </>
                    ) : (
                      <p className="mt-2">没有报告最近的事件。</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500">最后更新时间：{lastUpdated}</p>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>历史事件</CardTitle>
          <CardDescription>系统维护和故障历史记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historyEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-100">
                <div className="flex-shrink-0 mt-1">
                  {statusIcons[event.status]}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold">{event.date}</h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      event.status === 'operational' ? 'bg-green-100 text-green-600' :
                      event.status === 'planned-maintenance' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {statusText[event.status]}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>{event.title}</span>
                    <span className="ml-2">{event.startTime} ~ {event.endTime}</span>
                    <span className="flex items-center ml-2">
                      <Clock className="h-4 w-4 mr-1" />
                      {(() => {
                        const start = new Date(`${event.date} ${event.startTime}`);
                        const end = new Date(`${event.date} ${event.endTime}`);
                        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                        return `${diff}小时`;
                      })()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {services.map((service) => (
        <Modal
          key={`settings-${service.id}`}
          isOpen={settingsModalOpen === service.id}
          onClose={() => setSettingsModalOpen(null)}
          title={`${service.name}监控设置`}
        >
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const newSettings: MonitoringSettings = {
              checkInterval: Number(formData.get('checkInterval')),
              alertThreshold: Number(formData.get('alertThreshold')),
              notificationsEnabled: formData.get('notificationsEnabled') === 'on',
              maxToleranceTime: Number(formData.get('maxToleranceTime'))
            }
            updateServiceSettings(service.id, newSettings)
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="checkInterval">检查间隔（秒）</Label>
                <Input 
                  id="checkInterval" 
                  name="checkInterval" 
                  type="number" 
                  defaultValue={service.monitoringSettings.checkInterval}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alertThreshold">警报阈值（失败次数）</Label>
                <Input 
                  id="alertThreshold" 
                  name="alertThreshold" 
                  type="number" 
                  defaultValue={service.monitoringSettings.alertThreshold}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxToleranceTime">最大容忍时间（毫秒）</Label>
                <Input 
                  id="maxToleranceTime" 
                  name="maxToleranceTime" 
                  type="number" 
                  defaultValue={service.monitoringSettings.maxToleranceTime}
                  min="1"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="notificationsEnabled" 
                  name="notificationsEnabled"
                  defaultChecked={service.monitoringSettings.notificationsEnabled}
                />
                <Label htmlFor="notificationsEnabled">启用通知</Label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setSettingsModalOpen(null)}>取消</Button>
              <Button type="submit">保存更改</Button>
            </div>
          </form>
        </Modal>
      ))}
    </div>
  )
}

