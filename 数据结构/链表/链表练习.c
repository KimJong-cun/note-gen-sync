/*
 * 链表操作练习
 * 版权所有：米醋电子工作室 | KimJong
 */

#include <stdio.h>
#include <stdlib.h>

#define OK 1
#define ERROR 0
#define Status int

// 单链表节点定义
typedef struct LNode {
    int data;              // 数据域
    struct LNode *next;    // 指针域，指向下一个节点
} LNode, *LinkList;

/* ==================== 待实现的函数 ==================== */

// 1. 初始化链表
Status InitList(LinkList *L) {
    *L = (LinkList)malloc(sizeof(LNode));
    if (!(*L)) return ERROR;
    (*L)->next = NULL;
    return OK;
}

// 2. 判断链表是否为空
int ListEmpty(LinkList L) {
    // TODO: 如果链表为空返回1，否则返回0

}

// 3. 获取链表长度
int ListLength(LinkList L) {
    
    LinkList p = L->next; // 从第一个节点开始
    int length = 0;
    while (p!=NULL)
    {
        length++;
        p = p->next;
    }
    return length;  

}

// 4. 按序号查找节点
LNode *GetElem(LinkList L, int i) {
    LinkList p = L->next;
    int j=1;
    if (i==0) return L;
    if (i<0) return NULL;
    while (j<i&&p!=NULL)
    {
        p = p->next;
        j++;
    }
    return p;
        // TODO: 查找第i个节点，成功返回节点指针，失败返回NULL
    // 提示：
    // 1. 如果i==0，返回头节点L
    // 2. 如果i<0，返回NULL
    // 3. 使用计数器j，从1开始
    // 4. 循环条件：p不为空且j<i

}

// 5. 按值查找节点
LNode *LocateElem(LinkList L, int e) {
    LinkList p=L->next;
    while (p != NULL && p->data != e)
    {
        p=p->next;
    }
    return p;


    // TODO: 查找值为e的节点，成功返回节点指针，失败返回NULL

}

// 6. 在第i个位置插入元素e
Status ListInsert(LinkList L, int i, int e) {
    LinkList p = L;
    int j=0;
    while(j<i-1&&p!=NULL)
    {
        p=p->next;
        j++;
    }
    if (p==NULL) return ERROR;
    LinkList s = (LinkList)malloc(sizeof(LNode));
    s->data = e;
    s->next = p->next;
    // TODO: 在第i个位置插入元素e
    // 提示：
    // 1. 先找到第i-1个节点
    // 2. 检查位置是否合法
    // 3. 创建新节点，使用malloc分配内存
    // 4. 修改指针完成插入

}

// 7. 删除第i个位置的元素
Status ListDelete(LinkList L, int i, int *e) {
    // TODO: 删除第i个位置的元素，用e返回其值
    // 提示：
    // 1. 找到第i-1个节点
    // 2. 检查位置是否合法
    // 3. 保存要删除的节点
    // 4. 修改指针，释放内存

}




/* ==================== 测试函数 ==================== */

int main() {
    LinkList L;
    int choice, i, e;
    int a[] = {1, 2, 3, 4, 5};

    while (1) {
        printf("\n========== 链表操作练习 ==========\n");
        printf("1. 初始化链表\n");
        printf("2. 判断链表是否为空\n");
        printf("3. 获取链表长度\n");
        printf("4. 按序号查找节点\n");
        printf("5. 按值查找节点\n");
        printf("6. 插入元素\n");
        printf("7. 删除元素\n");
        printf("8. 头插法建立链表\n");
        printf("9. 尾插法建立链表\n");
        printf("10. 打印链表\n");
        printf("11. 销毁链表\n");
        printf("0. 退出\n");
        printf("====================================\n");
        printf("请选择操作：");
        scanf("%d", &choice);

        switch (choice) {
            case 1:
                if (InitList(&L) == OK)
                    printf("初始化成功！\n");
                else
                    printf("初始化失败！\n");
                break;

            case 2:
                if (ListEmpty(L))
                    printf("链表为空\n");
                else
                    printf("链表不为空\n");
                break;

            case 3:
                printf("链表长度：%d\n", ListLength(L));
                break;

            case 4:
                printf("请输入要查找的位置：");
                scanf("%d", &i);
                LNode *p = GetElem(L, i);
                if (p)
                    printf("第%d个元素的值为：%d\n", i, p->data);
                else
                    printf("查找失败！\n");
                break;

            case 5:
                printf("请输入要查找的值：");
                scanf("%d", &e);
                p = LocateElem(L, e);
                if (p)
                    printf("找到值为%d的节点\n", e);
                else
                    printf("未找到值为%d的节点\n", e);
                break;

            case 6:
                printf("请输入插入位置和元素值：");
                scanf("%d %d", &i, &e);
                if (ListInsert(L, i, e) == OK)
                    printf("插入成功！\n");
                else
                    printf("插入失败！\n");
                break;

            case 7:
                printf("请输入删除位置：");
                scanf("%d", &i);
                if (ListDelete(L, i, &e) == OK)
                    printf("删除成功！删除的元素值为：%d\n", e);
                else
                    printf("删除失败！\n");
                break;

            case 8:
                if (CreateList_H(&L, a, 5) == OK) {
                    printf("头插法建立链表成功！\n");
                    PrintList(L);
                }
                break;

            case 9:
                if (CreateList_T(&L, a, 5) == OK) {
                    printf("尾插法建立链表成功！\n");
                    PrintList(L);
                }
                break;

            case 10:
                printf("链表元素：");
                PrintList(L);
                break;

            case 11:
                DestroyList(&L);
                printf("链表已销毁！\n");
                break;

            case 0:
                DestroyList(&L);
                printf("程序退出！\n");
                return 0;

            default:
                printf("无效的选择！\n");
        }
    }

    return 0;
}
