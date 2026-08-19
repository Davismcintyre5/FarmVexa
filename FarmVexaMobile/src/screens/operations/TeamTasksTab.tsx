import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { teamApi, taskApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

interface TeamTasksTabProps {
  readOnly?: boolean;
}

export default function TeamTasksTab({ readOnly = false }: TeamTasksTabProps) {
  const { user } = useAuth();
  const { farms } = useFarms();
  const isFarmer = user?.role === 'farmer';
  const canManageTeam = user?.role === 'farmer';
  const canManageTasks = ['farmer', 'manager'].includes(user?.role);

  const [farmId, setFarmId] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'team' | 'tasks'>('team');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [modalType, setModalType] = useState<'member' | 'task'>('member');
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: 'worker',
    phone: '',
    email: '',
    salary: '',
    hireDate: '',
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    if (!isFarmer && user?.farm) {
      setFarmId(user.farm);
    }
  }, [user]);

  useEffect(() => {
    if (farmId) {
      loadData();
    }
  }, [farmId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teamRes, tasksRes] = await Promise.all([
        teamApi.getTeam(farmId),
        taskApi.getTasks(farmId),
      ]);
      setMembers(teamRes.data.data?.members || []);
      setTasks(tasksRes.data.data?.tasks || []);
    } catch (error) {
      setMembers([]);
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const openAddMember = () => {
    setEditing(null);
    setModalType('member');
    setMemberForm({ name: '', role: 'worker', phone: '', email: '', salary: '', hireDate: '' });
    setShowModal(true);
  };

  const openEditMember = (member: any) => {
    setEditing(member);
    setModalType('member');
    setMemberForm({
      name: member.name,
      role: member.role,
      phone: member.phone || '',
      email: member.email || '',
      salary: member.salary ? String(member.salary) : '',
      hireDate: member.hireDate?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const openAddTask = () => {
    setEditing(null);
    setModalType('task');
    setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
    setShowModal(true);
  };

  const openEditTask = (task: any) => {
    setEditing(task);
    setModalType('task');
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      priority: task.priority,
      dueDate: task.dueDate?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalType === 'member') {
        if (!memberForm.name) {
          Alert.alert('Error', 'Name required');
          return;
        }
        if (editing) {
          await teamApi.updateMember(editing._id, memberForm);
          Alert.alert('Success', 'Member updated');
        } else {
          await teamApi.addMember(farmId, { ...memberForm, salary: Number(memberForm.salary) || 0 });
          Alert.alert('Success', 'Member added');
        }
      } else {
        if (!taskForm.title) {
          Alert.alert('Error', 'Title required');
          return;
        }
        if (editing) {
          await taskApi.updateTask(editing._id, taskForm);
          Alert.alert('Success', 'Task updated');
        } else {
          await taskApi.createTask(farmId, taskForm);
          Alert.alert('Success', 'Task created');
        }
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    }
  };

  const handleToggleMember = async (id: string) => {
    try {
      await teamApi.toggleMember(id);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle member');
    }
  };

  const handleDeleteMember = (id: string) => {
    Alert.alert('Delete Member', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await teamApi.deleteMember(id);
            setMembers((prev) => prev.filter((m) => m._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleTaskStatus = async (id: string, status: string) => {
    try {
      await taskApi.updateTaskStatus(id, status);
      await loadData();
      Alert.alert('Success', status === 'completed' ? 'Completed!' : 'Updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTask = (id: string) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await taskApi.deleteTask(id);
            setTasks((prev) => prev.filter((t) => t._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const priorityColors: Record<string, string> = {
    low: colors.blue[100],
    medium: colors.yellow[100],
    high: colors.orange[100],
    urgent: colors.red[100],
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const roleOptions = ['worker', 'vet', 'manager', 'other'].map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
  }));

  const priorityOptions = ['low', 'medium', 'high', 'urgent'].map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
  }));

  return (
    <View style={styles.container}>
      {/* Farm Selector */}
      {isFarmer && (
        <View style={styles.farmSelector}>
          <Select
            label="Farm"
            value={farmId}
            onChange={setFarmId}
            options={farms.map((f) => ({ value: f._id, label: f.name }))}
            placeholder="Select Farm"
          />
        </View>
      )}

      {/* Tab Switch */}
      <View style={styles.tabSwitch}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'team' && styles.tabButtonActive]}
          onPress={() => setActiveTab('team')}
        >
          <Ionicons
            name="people"
            size={18}
            color={activeTab === 'team' ? colors.primary[500] : colors.gray[500]}
          />
          <Text style={[styles.tabText, activeTab === 'team' && styles.tabTextActive]}>
            Team ({members.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tasks' && styles.tabButtonActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Ionicons
            name="checkmark-done"
            size={18}
            color={activeTab === 'tasks' ? colors.primary[500] : colors.gray[500]}
          />
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
            Tasks ({pendingTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {!farmId ? (
        <EmptyState title="Select a farm" />
      ) : loading ? (
        <Spinner size="lg" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <View style={styles.section}>
              {canManageTeam && !readOnly && (
                <Button onPress={openAddMember} size="sm">
                  <Ionicons name="add" size={18} color={colors.white} /> Add Member
                </Button>
              )}

              {members.length === 0 ? (
                <EmptyState icon="people-outline" title="No team members" />
              ) : (
                <View style={styles.membersList}>
                  {members.map((member) => (
                    <Card key={member._id} style={styles.memberCard}>
                      <View style={styles.memberHeader}>
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>{member.name}</Text>
                          <Text style={styles.memberRole}>{member.role}</Text>
                          {member.phone && (
                            <Text style={styles.memberDetail}>📞 {member.phone}</Text>
                          )}
                          {member.email && (
                            <Text style={styles.memberDetail}>📧 {member.email}</Text>
                          )}
                          {member.salary > 0 && (
                            <Text style={styles.memberSalary}>
                              KES {member.salary.toLocaleString()}/mo
                            </Text>
                          )}
                        </View>
                        <Badge status={member.status} />
                      </View>

                      {canManageTeam && !readOnly && (
                        <View style={styles.memberActions}>
                          <TouchableOpacity onPress={() => openEditMember(member)}>
                            <Ionicons name="pencil" size={16} color={colors.gray[400]} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleToggleMember(member._id)}>
                            <Text style={styles.toggleText}>
                              {member.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteMember(member._id)} style={styles.deleteButton}>
                            <Ionicons name="trash" size={16} color={colors.red[500]} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </Card>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <View style={styles.section}>
              {canManageTasks && !readOnly && (
                <Button onPress={openAddTask} size="sm">
                  <Ionicons name="add" size={18} color={colors.white} /> Add Task
                </Button>
              )}

              {tasks.length === 0 ? (
                <EmptyState icon="checkmark-done-outline" title="No tasks" />
              ) : (
                <View style={styles.tasksList}>
                  {/* Pending Tasks */}
                  {pendingTasks.length > 0 && (
                    <Card title="Pending Tasks" style={styles.taskCard}>
                      {pendingTasks.map((task) => (
                        <View key={task._id} style={styles.taskItem}>
                          <View style={styles.taskInfo}>
                            <View style={styles.taskTitleRow}>
                              <View style={[styles.priorityBadge, { backgroundColor: priorityColors[task.priority] || colors.gray[100] }]}>
                                <Text style={styles.priorityText}>{task.priority}</Text>
                              </View>
                              <Text style={styles.taskTitle} numberOfLines={1}>
                                {task.title}
                              </Text>
                            </View>
                            <Text style={styles.taskDetail}>
                              {task.assignedTo?.name || 'Unassigned'} · Due: {task.dueDate ? formatDate(task.dueDate, 'date') : 'No date'}
                            </Text>
                          </View>
                          {canManageTasks && !readOnly && (
                            <View style={styles.taskActions}>
                              {task.status === 'pending' && (
                                <TouchableOpacity onPress={() => handleTaskStatus(task._id, 'in_progress')}>
                                  <Text style={styles.startText}>Start</Text>
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity onPress={() => handleTaskStatus(task._id, 'completed')}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => openEditTask(task)}>
                                <Ionicons name="pencil" size={14} color={colors.gray[400]} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteTask(task._id)}>
                                <Ionicons name="trash" size={14} color={colors.red[500]} />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      ))}
                    </Card>
                  )}

                  {/* Completed Tasks */}
                  {completedTasks.length > 0 && (
                    <Card title="Completed" style={styles.taskCard}>
                      {completedTasks.map((task) => (
                        <View key={task._id} style={styles.completedTask}>
                          <Text style={styles.completedTaskText}>{task.title}</Text>
                          <Text style={styles.completedTaskBy}>
                            {task.assignedTo?.name || 'Unassigned'}
                          </Text>
                        </View>
                      ))}
                    </Card>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === 'member'
            ? editing
              ? 'Edit Member'
              : 'Add Member'
            : editing
            ? 'Edit Task'
            : 'Add Task'
        }
        size="lg"
      >
        <ScrollView contentContainerStyle={styles.modalContent}>
          {modalType === 'member' ? (
            <>
              <Input
                label="Name *"
                value={memberForm.name}
                onChangeText={(text) => setMemberForm({ ...memberForm, name: text })}
                placeholder="Member name"
              />
              <Select
                label="Role"
                value={memberForm.role}
                onChange={(value) => setMemberForm({ ...memberForm, role: value })}
                options={roleOptions}
                placeholder="Select Role"
              />
              <Input
                label="Phone"
                value={memberForm.phone}
                onChangeText={(text) => setMemberForm({ ...memberForm, phone: text })}
                placeholder="+254 700 000 000"
                keyboardType="phone-pad"
              />
              <Input
                label="Email"
                value={memberForm.email}
                onChangeText={(text) => setMemberForm({ ...memberForm, email: text })}
                placeholder="member@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Salary (KES)"
                value={memberForm.salary}
                onChangeText={(text) => setMemberForm({ ...memberForm, salary: text })}
                placeholder="0"
                keyboardType="numeric"
              />
              <Input
                label="Hire Date"
                value={memberForm.hireDate}
                onChangeText={(text) => setMemberForm({ ...memberForm, hireDate: text })}
                placeholder="YYYY-MM-DD"
              />
            </>
          ) : (
            <>
              <Input
                label="Title *"
                value={taskForm.title}
                onChangeText={(text) => setTaskForm({ ...taskForm, title: text })}
                placeholder="Task title"
              />
              <Input
                label="Description"
                value={taskForm.description}
                onChangeText={(text) => setTaskForm({ ...taskForm, description: text })}
                placeholder="Task description"
                multiline
              />
              <Select
                label="Assign To"
                value={taskForm.assignedTo}
                onChange={(value) => setTaskForm({ ...taskForm, assignedTo: value })}
                options={members.map((m) => ({ value: m._id, label: m.name }))}
                placeholder="Select Member"
              />
              <Select
                label="Priority"
                value={taskForm.priority}
                onChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                options={priorityOptions}
                placeholder="Select Priority"
              />
              <Input
                label="Due Date"
                value={taskForm.dueDate}
                onChangeText={(text) => setTaskForm({ ...taskForm, dueDate: text })}
                placeholder="YYYY-MM-DD"
              />
            </>
          )}

          <View style={styles.modalActions}>
            <Button variant="outline" onPress={() => setShowModal(false)} style={styles.flex1}>
              Cancel
            </Button>
            <Button onPress={handleSave} style={styles.flex1}>
              {editing ? 'Update' : 'Add'}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  farmSelector: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  tabSwitch: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
  },
  tabButtonActive: {
    backgroundColor: colors.primary[50],
  },
  tabText: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary[500],
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  membersList: {
    gap: spacing.sm,
  },
  memberCard: {
    gap: spacing.sm,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  memberRole: {
    fontSize: 13,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  memberDetail: {
    fontSize: 12,
    color: colors.gray[500],
  },
  memberSalary: {
    fontSize: 13,
    color: colors.primary[600],
    fontWeight: '500',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  toggleText: {
    fontSize: 12,
    color: colors.primary[500],
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  tasksList: {
    gap: spacing.md,
  },
  taskCard: {
    gap: spacing.xs,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  taskInfo: {
    flex: 1,
    gap: 2,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
    flex: 1,
  },
  taskDetail: {
    fontSize: 12,
    color: colors.gray[400],
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  startText: {
    fontSize: 12,
    color: colors.blue[500],
  },
  completedTask: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  completedTaskText: {
    fontSize: 14,
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },
  completedTaskBy: {
    fontSize: 12,
    color: colors.gray[400],
  },
  modalContent: {
    gap: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
});