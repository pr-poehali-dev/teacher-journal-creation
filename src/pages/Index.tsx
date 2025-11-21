import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface Student {
  id: number;
  name: string;
  class: string;
  grades: { subject: string; value: number; comment?: string; date: string }[];
  attendance: { date: string; status: 'present' | 'absent' | 'late' }[];
  behavior: { date: string; note: string; type: 'positive' | 'negative' }[];
  avatar: string;
}

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newGrade, setNewGrade] = useState({ subject: '', value: 5, comment: '', date: new Date().toISOString().split('T')[0] });
  const [newStudent, setNewStudent] = useState({ name: '', class: '' });
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [isAddBehaviorOpen, setIsAddBehaviorOpen] = useState(false);
  const [newBehavior, setNewBehavior] = useState({ note: '', type: 'positive' as 'positive' | 'negative', date: new Date().toISOString().split('T')[0] });
  const [currentStudentId, setCurrentStudentId] = useState<number | null>(null);

  const addStudent = () => {
    if (!newStudent.name || !newStudent.class) return;
    
    const initials = newStudent.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
    
    const newStudentData: Student = {
      id: Date.now(),
      name: newStudent.name,
      class: newStudent.class,
      grades: [],
      attendance: [],
      behavior: [],
      avatar: initials
    };
    
    setStudents([...students, newStudentData]);
    setNewStudent({ name: '', class: '' });
    setIsAddStudentOpen(false);
  };

  const addGrade = (studentId: number) => {
    if (!newGrade.subject) return;
    
    setStudents(students.map(student => 
      student.id === studentId 
        ? {
            ...student,
            grades: [...student.grades, { 
              subject: newGrade.subject,
              value: newGrade.value,
              comment: newGrade.comment,
              date: newGrade.date
            }]
          }
        : student
    ));
    setNewGrade({ subject: '', value: 5, comment: '', date: new Date().toISOString().split('T')[0] });
    setIsAddGradeOpen(false);
  };

  const addAttendance = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? {
            ...student,
            attendance: [...student.attendance, { 
              date: new Date().toISOString().split('T')[0],
              status
            }]
          }
        : student
    ));
  };

  const addBehaviorNote = (studentId: number) => {
    if (!newBehavior.note) return;
    
    setStudents(students.map(student => 
      student.id === studentId 
        ? {
            ...student,
            behavior: [...student.behavior, { 
              date: newBehavior.date,
              note: newBehavior.note,
              type: newBehavior.type
            }]
          }
        : student
    ));
    setNewBehavior({ note: '', type: 'positive', date: new Date().toISOString().split('T')[0] });
    setIsAddBehaviorOpen(false);
  };

  const deleteStudent = (studentId: number) => {
    setStudents(students.filter(student => student.id !== studentId));
  };

  const calculateAverage = (grades: { value: number }[]) => {
    if (grades.length === 0) return 0;
    return (grades.reduce((sum, g) => sum + g.value, 0) / grades.length).toFixed(1);
  };

  const getAttendanceRate = (attendance: { status: string }[]) => {
    if (attendance.length === 0) return 100;
    const present = attendance.filter(a => a.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Электронный журнал</h1>
            <p className="text-muted-foreground">Управление успеваемостью и посещаемостью</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="lg">
                  <Icon name="UserPlus" className="mr-2" size={18} />
                  Добавить ученика
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить нового ученика</DialogTitle>
                  <DialogDescription>Введите данные ученика для добавления в журнал</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>ФИО ученика</Label>
                    <Input
                      placeholder="Иванов Иван Иванович"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Класс</Label>
                    <Input
                      placeholder="9А"
                      value={newStudent.class}
                      onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={addStudent}>
                    Добавить ученика
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Users" size={20} className="text-primary" />
                Всего учеников
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{students.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="TrendingUp" size={20} className="text-secondary" />
                Средний балл класса
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-secondary">
                {calculateAverage(students.flatMap(s => s.grades))}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                Посещаемость
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {Math.round(students.reduce((sum, s) => sum + getAttendanceRate(s.attendance), 0) / students.length)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="students" className="gap-2">
              <Icon name="Users" size={18} />
              Ученики
            </TabsTrigger>
            <TabsTrigger value="grades" className="gap-2">
              <Icon name="Award" size={18} />
              Оценки
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <Icon name="Calendar" size={18} />
              Посещаемость
            </TabsTrigger>
            <TabsTrigger value="behavior" className="gap-2">
              <Icon name="MessageSquare" size={18} />
              Замечания
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4 animate-fade-in">
            {students.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Нет учеников</h3>
                <p className="text-muted-foreground mb-4">Добавьте первого ученика, чтобы начать работу с журналом</p>
                <Button onClick={() => setIsAddStudentOpen(true)}>
                  <Icon name="UserPlus" className="mr-2" size={18} />
                  Добавить ученика
                </Button>
              </Card>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 bg-primary text-primary-foreground text-lg font-semibold">
                        <AvatarFallback>{student.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{student.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="outline">{student.class}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Средний балл</span>
                        <span className="font-semibold text-primary">{calculateAverage(student.grades)}</span>
                      </div>
                      <Progress value={parseFloat(calculateAverage(student.grades)) * 20} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Посещаемость</span>
                        <span className="font-semibold text-green-600">{getAttendanceRate(student.attendance)}%</span>
                      </div>
                      <Progress value={getAttendanceRate(student.attendance)} className="h-2" />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <Icon name="Eye" className="mr-2" size={16} />
                          Подробнее
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
                              <AvatarFallback>{student.avatar}</AvatarFallback>
                            </Avatar>
                            {student.name}
                          </DialogTitle>
                          <DialogDescription>
                            Класс {student.class} • Средний балл: {calculateAverage(student.grades)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Icon name="Award" size={18} className="text-primary" />
                              Оценки
                            </h4>
                            <div className="space-y-2">
                              {student.grades.map((grade, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <div>
                                    <p className="font-medium">{grade.subject}</p>
                                    {grade.comment && <p className="text-sm text-muted-foreground">{grade.comment}</p>}
                                  </div>
                                  <div className="text-right">
                                    <Badge 
                                      variant={grade.value >= 4 ? "default" : "secondary"}
                                      className="text-lg px-3 py-1"
                                    >
                                      {grade.value}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground mt-1">{grade.date}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </TabsContent>

          <TabsContent value="grades" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Журнал оценок</CardTitle>
                <CardDescription>Добавляйте оценки и комментарии к ним</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {students.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                            <AvatarFallback>{student.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{student.name}</h4>
                            <p className="text-sm text-muted-foreground">Средний балл: {calculateAverage(student.grades)}</p>
                          </div>
                        </div>
                        <Dialog open={isAddGradeOpen && currentStudentId === student.id} onOpenChange={(open) => {
                          setIsAddGradeOpen(open);
                          if (open) setCurrentStudentId(student.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setCurrentStudentId(student.id)}>
                              <Icon name="Plus" className="mr-2" size={16} />
                              Добавить оценку
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Добавить оценку для {student.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Предмет</Label>
                                <Input
                                  placeholder="Математика, Русский язык..."
                                  value={newGrade.subject}
                                  onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Оценка</Label>
                                <Select
                                  value={String(newGrade.value)}
                                  onValueChange={(value) => setNewGrade({ ...newGrade, value: parseInt(value) })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">5 (отлично)</SelectItem>
                                    <SelectItem value="4">4 (хорошо)</SelectItem>
                                    <SelectItem value="3">3 (удовлетворительно)</SelectItem>
                                    <SelectItem value="2">2 (неудовлетворительно)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Дата</Label>
                                <Input
                                  type="date"
                                  value={newGrade.date}
                                  onChange={(e) => setNewGrade({ ...newGrade, date: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Комментарий (необязательно)</Label>
                                <Textarea
                                  placeholder="Добавьте комментарий к оценке..."
                                  value={newGrade.comment}
                                  onChange={(e) => setNewGrade({ ...newGrade, comment: e.target.value })}
                                />
                              </div>
                              <Button 
                                className="w-full" 
                                onClick={() => addGrade(student.id)}
                              >
                                Сохранить оценку
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {student.grades.map((grade, idx) => (
                          <div
                            key={idx}
                            className="group relative"
                          >
                            <Badge
                              variant={grade.value >= 4 ? "default" : "secondary"}
                              className="text-base px-3 py-1 cursor-pointer"
                            >
                              {grade.value}
                            </Badge>
                            {grade.comment && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <p className="font-semibold mb-1">{grade.subject}</p>
                                <p>{grade.comment}</p>
                                <p className="text-muted-foreground mt-1">{grade.date}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Посещаемость</CardTitle>
                <CardDescription>Отмечайте присутствие учеников на занятиях</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                          <AvatarFallback>{student.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Посещаемость: {getAttendanceRate(student.attendance)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => addAttendance(student.id, 'present')} title="Присутствует">
                          <Icon name="Check" size={16} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addAttendance(student.id, 'late')} title="Опоздал">
                          <Icon name="Clock" size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => addAttendance(student.id, 'absent')} title="Отсутствует">
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Замечания по поведению</CardTitle>
                <CardDescription>Фиксируйте позитивные и негативные моменты</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                            <AvatarFallback>{student.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{student.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {student.behavior.length} замечаний
                            </p>
                          </div>
                        </div>
                        <Dialog open={isAddBehaviorOpen && currentStudentId === student.id} onOpenChange={(open) => {
                          setIsAddBehaviorOpen(open);
                          if (open) setCurrentStudentId(student.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setCurrentStudentId(student.id)}>
                              <Icon name="Plus" className="mr-2" size={16} />
                              Добавить
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Добавить замечание для {student.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Тип замечания</Label>
                                <Select
                                  value={newBehavior.type}
                                  onValueChange={(value: 'positive' | 'negative') => setNewBehavior({ ...newBehavior, type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="positive">Позитивное</SelectItem>
                                    <SelectItem value="negative">Негативное</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Дата</Label>
                                <Input
                                  type="date"
                                  value={newBehavior.date}
                                  onChange={(e) => setNewBehavior({ ...newBehavior, date: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Описание</Label>
                                <Textarea
                                  placeholder="Опишите ситуацию..."
                                  value={newBehavior.note}
                                  onChange={(e) => setNewBehavior({ ...newBehavior, note: e.target.value })}
                                />
                              </div>
                              <Button 
                                className="w-full" 
                                onClick={() => addBehaviorNote(student.id)}
                              >
                                Сохранить замечание
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {student.behavior.length > 0 && (
                        <div className="space-y-2">
                          {student.behavior.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg ${
                                item.type === 'positive' 
                                  ? 'bg-green-50 border border-green-200' 
                                  : 'bg-red-50 border border-red-200'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <Icon
                                  name={item.type === 'positive' ? 'ThumbsUp' : 'AlertCircle'}
                                  size={16}
                                  className={item.type === 'positive' ? 'text-green-600' : 'text-red-600'}
                                />
                                <div className="flex-1">
                                  <p className="text-sm">{item.note}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;